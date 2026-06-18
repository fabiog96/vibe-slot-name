# BetMarket — Betting System (Full Stack)

## Context

Sistema di scommesse stile Polymarket integrato nella slot machine. Gli utenti si autenticano via Cognito, scommettono prima dello spin, e vedono i risultati con chip reali. Uno spin a settimana. Il BE diventa source of truth per lo spin.

Deployato dentro l'infrastruttura AWS di adklab, seguendo le stesse convenzioni architetturali.

---

## Decisioni Architetturali

| Decisione | Scelta |
|-----------|--------|
| Auth | AWS Cognito (adklab User Pool) |
| DB | DynamoDB + PynamoDB |
| BE runtime | FastAPI + Lambda + Mangum |
| API | API Gateway |
| IaC | Terraform |
| Real-time | Polling adattivo + countdown locale da timestamp |
| Timer betting | 2 minuti |
| FE | Sub-project dentro `adklab-frontend` (`projects/betmarket/`) |
| FE deploy | Gestito dal CI/CD di adklab-frontend (S3 + CloudFront) |
| Repo BE | `betmarket-service` (repo separato) |
| CI/CD BE | GitHub Actions + release-please (build → test → push ECR → Terraform apply) |
| Docker | Multi-stage (base/dev/prod) con Lambda RIE |
| Dev locale | docker-compose + LocalStack |
| Utenti = Partecipanti | Si, stessa persona |
| Partecipazione | Tutti i registrati, sempre |
| Ruoli | Fissi nel BE (configurati una volta) |
| Chi avvia spin | Chiunque autenticato |
| Dev auth | Mock mode con header `X-Mock-User` |

---

## Polling Adattivo

| Stato game | Frequenza polling | Motivo |
|------------|-------------------|--------|
| **IDLE** | Ogni 30s | Solo per detectare se qualcuno avvia uno spin |
| **BETTING** | Ogni 3s | Timer attivo, serve reattivita' |
| **RESULT** | Ogni 5s | Mostra risultati |

Il polling "pesante" (3s) dura solo **2 minuti a settimana**.

---

## Game Flow

```
1. Utente apre l'app
   └─ FE inizia polling lento GET /game/status ogni 30s

2. Utente A clicca "Spin"
   └─ FE chiama POST /game/start (no body — partecipanti e ruoli vengono dal BE)
   └─ BE legge tutti gli utenti registrati + ruoli configurati
   └─ BE crea sessione BETTING, salva betting_ends_at = now + 2min
   └─ BE ritorna { game_id, participants, roles, betting_ends_at }

3. Tutti gli utenti collegati (polling GET /game/status ogni 3s)
   └─ Vedono stato BETTING + countdown (calcolato localmente da betting_ends_at)
   └─ Si apre automaticamente la modale betting

4. Ogni utente piazza le sue bet
   └─ FE chiama POST /bets { game_id, bet_type, participant_ids, role_ids, amount }
   └─ BE valida chip >= amount, scala chip, salva bet, ritorna odds + potential payout

5. Timer scade (o l'utente che ha avviato clicca "Spin Now")
   └─ FE chiama POST /game/{game_id}/execute
   └─ BE: Fisher-Yates shuffle server-side, salva risultato
   └─ BE: valuta tutte le bet, accredita vincite, aggiorna stats
   └─ BE: imposta stato RESULT

6. Tutti vedono (via polling)
   └─ Stato RESULT + spin result + proprie bet results
   └─ FE anima i reel verso il risultato del server
   └─ Modale mostra vincite/perdite

7. (Opzionale) Respin di un singolo ruolo
   └─ FE chiama POST /game/{game_id}/respin/{roleId}
   └─ BE: estrae nuovo vincitore (escludendo vincitori altri ruoli)
   └─ FE: anima solo quel rullo
   └─ Le bet NON vengono rivalutate

8. Dopo ~10s (o manualmente) stato torna a IDLE, polling torna a 30s
```

---

## Backend (`betmarket-service`)

### Struttura Progetto

```
betmarket-service/
├── .github/
│   └── workflows/
│       ├── ci.yml               # Build → Test → Push ECR → Terraform Apply
│       └── release-please.yml   # Crea Release PR + changelog
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI + Mangum lambda_handler
│   ├── configs/
│   │   ├── dev.json
│   │   └── prod.json
│   ├── dependencies/
│   │   ├── __init__.py
│   │   ├── auth.py              # get_current_user (Cognito JWT / Mock)
│   │   └── database.py          # DynamoDB table references
│   ├── libs/
│   │   └── commons/             # Git submodule (adk-commons-sublib)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py              # PynamoDB models
│   │   ├── game.py
│   │   ├── bet.py
│   │   ├── config.py
│   │   └── stat.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py              # Pydantic API request/response
│   │   ├── game.py
│   │   └── bet.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── user_service.py      # Chip management, stats, leaderboard
│   │   ├── game_service.py      # Start, execute, status
│   │   ├── bet_service.py       # Place, evaluate, payout
│   │   └── odds_service.py      # Historical odds calculation
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── users.py             # HTTP only, delega a services
│   │   ├── game.py
│   │   └── bets.py
│   ├── middlewares/
│   │   └── __init__.py
│   └── scripts/                 # Lambda scripts (es. auto-execute scaduti)
│       └── __init__.py
├── tests/
├── infra/                       # Terraform
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── lambda.tf
│   ├── dynamodb.tf
│   ├── api_gateway.tf
│   ├── cognito.tf              # Se serve User Pool dedicato
│   └── s3.tf                   # Se servono bucket per assets/config
├── Dockerfile                   # Multi-stage (base/dev/prod) con Lambda RIE
├── docker-compose.yaml          # FastAPI + LocalStack
├── init-aws.sh                  # Crea tabelle DynamoDB su LocalStack
├── requirements.txt
├── .env.example
└── README.md
```

### Librerie Python (`requirements.txt`)

```
fastapi
mangum
uvicorn
pynamodb
pydantic
pydantic-settings
python-jose[cryptography]
python-ulid
boto3
```

### Dockerfile (Lambda Emulation Pattern)

```dockerfile
FROM arm64v8/python:3.12-slim AS base

RUN apt-get update && apt-get install -y curl

ENV LAMBDA_TASK_ROOT=/var/task
ENV PYTHONPATH=$LAMBDA_TASK_ROOT
RUN mkdir -p $LAMBDA_TASK_ROOT
WORKDIR $LAMBDA_TASK_ROOT

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


FROM base AS dev
RUN pip install debugpy
RUN curl -Lo /usr/local/bin/aws-lambda-rie \
    https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie && \
    chmod +x /usr/local/bin/aws-lambda-rie;

COPY ./app .
EXPOSE 5678

CMD ["/usr/local/bin/aws-lambda-rie", "/usr/local/bin/python", "-m", "debugpy", \
     "--listen", "0.0.0.0:5678", "--wait-for-client", "-m", "awslambdaric", "main.lambda_handler"]


FROM base AS prod
COPY ./app .
RUN mkdir -p /app/logs

CMD ["/usr/local/bin/python", "-m", "awslambdaric", "main.lambda_handler"]
```

### docker-compose.yaml

```yaml
services:
  task:
    build:
      context: .
      target: dev
    platform: linux/arm64
    restart: on-failure
    environment:
      APP_NAME: betmarket-service
      LOCAL: true
      ENV: local
      CLOUD_ENV: local
      LOG_LEVEL: DEBUG
      AWS_ENDPOINT_URL: http://localstack:4566
      AWS_ACCESS_KEY_ID: test
      AWS_SECRET_ACCESS_KEY: test
      AWS_DEFAULT_REGION: eu-west-1
      AWS_LAMBDA_FUNCTION_TIMEOUT: 300
      AWS_LAMBDA_FUNCTION_MEMORY_SIZE: 512
      AUTH_MODE: mock
    volumes:
      - ./app:/var/task
      - ~/.aws:/root/.aws:ro
    ports:
      - 9000:8080
      - 5678:5678
    command: >
      sh -c "python -Xfrozen_modules=off -m debugpy --listen 0.0.0.0:5678
      --wait-for-client -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload --log-level debug"

  localstack:
    image: localstack/localstack
    ports:
      - "127.0.0.1:4566:4566"
    environment:
      DEBUG: ${DEBUG:-0}
    volumes:
      - "${LOCALSTACK_VOLUME_DIR:-./localstack_volume}:/var/lib/localstack"
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./init-aws.sh:/etc/localstack/init/ready.d/init-aws.sh:ro"
```

### init-aws.sh

```bash
#!/bin/bash
export AWS_DEFAULT_REGION=eu-west-1

# ── DynamoDB Tables ──
awslocal dynamodb create-table \
  --table-name betmarket \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    '[{
      "IndexName": "GSI1",
      "KeySchema": [
        {"AttributeName": "GSI1PK", "KeyType": "HASH"},
        {"AttributeName": "GSI1SK", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "ALL"}
    }]' \
  --billing-mode PAY_PER_REQUEST

# ── Seed: roles config ──
awslocal dynamodb put-item \
  --table-name betmarket \
  --item '{
    "PK": {"S": "CONFIG"},
    "SK": {"S": "ROLES"},
    "roles": {"L": [
      {"M": {"id": {"S": "r1"}, "name": {"S": "Moderator"}}},
      {"M": {"id": {"S": "r2"}, "name": {"S": "Notary"}}}
    ]}
  }'

echo "LocalStack init complete."
```

### DynamoDB — Single Table `betmarket`

**Keys:** `PK` (String), `SK` (String)
**GSI1:** `GSI1PK` (String), `GSI1SK` (String)

| Entity | PK | SK | Attributi principali |
|--------|----|----|----------------------|
| User | `USER#{sub}` | `PROFILE` | display_name, chips, total_bets, total_wins, current_streak, best_streak |
| Config | `CONFIG` | `ROLES` | roles: [{ id, name }] |
| Game | `GAME#{ulid}` | `META` | status, participants, roles, result, betting_ends_at, created_by |
| Bet | `GAME#{game_id}` | `BET#{sub}#{ulid}` | bet_type, participant_ids, role_ids, amount, odds, won, payout |
| Stat | `STAT#{participant_name}` | `GLOBAL` | times_selected, total_spins |
| LastWinner | `CONFIG` | `LAST_WINNERS` | last_winners: { role_id: participant_id } — vincitori dello spin precedente |

**GSI1** (leaderboard): `GSI1PK = "LEADERBOARD"`, `GSI1SK = "CHIPS#{inverted_chips}"`
**GSI1** (bets per game): `GSI1PK = "GAME#{game_id}"`, `GSI1SK = "BET#{sub}"`

Chip scalate atomicamente con DynamoDB conditional update (`attribute_exists(chips) AND chips >= :amount`).

### API Endpoints

| Method | Path | Descrizione | Auth |
|--------|------|-------------|------|
| `GET` | `/health` | Health check | No |
| `POST` | `/game/start` | Avvia sessione betting (2min timer) | Si |
| `GET` | `/game/status` | Stato corrente + partecipanti + dati | Si |
| `POST` | `/game/{id}/execute` | Esegue full spin + valuta bet | Si |
| `POST` | `/game/{id}/respin/{roleId}` | Respin singolo ruolo (esclude vincitori altri ruoli) | Si |
| `POST` | `/bets` | Piazza scommessa | Si |
| `GET` | `/bets/me?game_id=` | Le mie bet per una sessione | Si |
| `GET` | `/users/me` | Profilo + chip + stats | Si |
| `GET` | `/users` | Lista utenti registrati (VIP list) | Si |
| `GET` | `/users/leaderboard` | Classifica per chip | Si |

### Tipi di Scommessa e Payout

| Tipo | Descrizione | Payout |
|------|-------------|--------|
| **SINGLE** | X vince ruolo Y | `odds × amount` |
| **ANY_ROLE** | X vince almeno un ruolo | `(odds / n_roles) × amount` |
| **COMBO** | X vince A e Y vince B | `odds_X × odds_Y × amount` |
| **NOT_SELECTED** | X non viene estratto | `(1 / (1 - 1/n_participants)) × amount` |

### Logica Spin (server-side)

#### Full Spin (`POST /game/{id}/execute`)
1. Legge `CONFIG#LAST_WINNERS` — chi ha vinto cosa la settimana scorsa
2. Per ogni ruolo, esclude il vincitore precedente dai candidati
3. Fisher-Yates shuffle dei candidati elegibili
4. I primi N della lista shufflata vengono assegnati ai N ruoli
3. Valuta tutte le bet piazzate per questo game
4. Accredita vincite, aggiorna stats/streak
5. Aggiorna `stats` collection (times_selected per partecipante)
6. Aggiorna `CONFIG#LAST_WINNERS` con i nuovi vincitori
7. Imposta status → RESULT
8. Ritorna `{ result, bet_results[] }`

#### Validazione anti-duplicato (automatica nel Full Spin)
- Il BE controlla l'ultimo game completato per ogni ruolo
- Se un partecipante ha vinto lo stesso ruolo la settimana precedente, viene **escluso automaticamente** dai candidati per quel ruolo
- Se dopo l'esclusione non ci sono candidati sufficienti, il vincolo viene rilassato

Questo elimina la necessità del respin manuale per questa regola. Lo shuffle già esclude i "repeat winners" per ruolo.

#### Respin manuale (`POST /game/{id}/respin/{roleId}`)
Disponibile comunque per casi eccezionali (es. qualcuno è assente).
1. Prende i vincitori degli **altri** ruoli e li esclude dai candidati
2. Tra i candidati rimanenti estrae un nuovo vincitore random
3. Aggiorna solo quel ruolo nel risultato
4. **Non rivaluta le bet** — il respin e' un aggiustamento post-risultato
5. Aggiorna `stats`
6. Ritorna `{ result }` aggiornato

### Sistema Quote (Odds)

```python
odds = (total_spins + 1) / (times_selected + 1)
# Clamped to [1.1, 20.0]
```

### Sistema Chip

- Ogni utente parte con **100 chip**
- Puntata minima: **1 chip**
- Chip scalate atomicamente con DynamoDB conditional update
- **Bancarotta** (0 chip): badge "BANKRUPT!", bet disabilitate
- **Decisione futura**: chi va in bancarotta si auto-assegna a un ruolo la settimana successiva

### Auth Middleware

Due modalita' tramite `AUTH_MODE` env var:

**Mock mode** (dev/local):
- Header `X-Mock-User: <nickname>`
- Crea profilo utente al volo se non esiste (100 chip)
- Nessun JWT, nessun Cognito

**Cognito mode** (prod):
- JWT nel header `Authorization: Bearer <token>`
- Verifica via `PyJWKClient` + `python-jose`
- JWKS: `https://cognito-idp.eu-west-1.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json`
- FastAPI `Depends(get_current_user)` su tutti i router

---

## Frontend (dentro `adklab-frontend`)

BetMarket non e' un repo separato — vive come **sub-project** dentro `adklab-frontend`, sfruttando l'infrastruttura gia' presente:

- **Auth**: gestita globalmente da `features/auth/` (Cognito + Amplify + Redux)
- **Store**: Redux store globale di adklab (si aggiungono solo i nuovi slices)
- **API**: `axiosInstance` con token interceptor gia' configurato
- **Routing**: si aggiunge una route in `App.tsx` wrappata con `<ProtectedRoute>`
- **RBAC**: `useHasRole('betmarket', 'user')` per controllare l'accesso

### Cosa si riusa da adklab (zero codice da scrivere)

| Feature | Gia' presente in adklab |
|---------|------------------------|
| Login (Google OAuth) | `features/auth/` + Cognito Hosted UI |
| Token management | `authSlice.ts` + `authThunks.ts` |
| Token in API calls | `axios.ts` request interceptor |
| Protected routes | `ProtectedRoute.tsx` |
| RBAC | `useHasRole()` da `roleUtils.ts` |
| Redux store | `app/store.ts` |
| Typed hooks | `useAppDispatch`, `useAppSelector` |
| API service | `apiService.ts` (GET/POST/PATCH/DELETE) |

### File da creare dentro adklab-frontend

```
src/
├── app/slices/
│   ├── gameSlice.ts                 # NUOVO — game state + reducers
│   └── bettingSlice.ts              # NUOVO — bets, chips, odds
├── projects/
│   └── betmarket/                   # NUOVO — sub-project
│       ├── api/
│       │   └── gameApi.ts           # Async thunks (placeBet, fetchStatus, executeSpin)
│       ├── components/
│       │   ├── SlotReel.tsx
│       │   ├── ControlPanel.tsx     # Read-only, utenti dal BE
│       │   ├── SettingsModal.tsx     # Solo toggle tema
│       │   ├── BettingModal.tsx
│       │   ├── BetCard.tsx
│       │   ├── OddsBar.tsx
│       │   ├── CountdownTimer.tsx
│       │   ├── BetSummary.tsx
│       │   ├── ChipBadge.tsx
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useSlotMachine.ts
│       │   ├── useGameSync.ts       # Polling adattivo → dispatch actions
│       │   └── useEasterEggs.ts
│       ├── pages/
│       │   └── GamePage.tsx         # Layout principale
│       ├── styles/
│       │   └── betmarket.css        # Stili specifici del progetto
│       ├── types/
│       │   └── index.ts
│       └── index.ts                 # Export BetMarket component
```

### File da modificare in adklab-frontend

| File | Modifica |
|------|----------|
| `src/app/store.ts` | Aggiungere `gameSlice` + `bettingSlice` al configureStore |
| `src/App.tsx` | Aggiungere route `/betmarket/*` con `<ProtectedRoute>` |
| `src/projects/index.ts` | Export `BetMarket` |
| `src/components/pages/Home.tsx` | Aggiungere card BetMarket nella home (con `useHasRole`) |

### Redux — Nuovi Slices

#### `gameSlice.ts`
```typescript
interface GameState {
  status: 'IDLE' | 'BETTING' | 'EXECUTING' | 'RESULT';
  gameId: string | null;
  participants: Participant[];
  roles: Role[];
  spinResult: SpinResult;
  bettingEndsAt: string | null;
  announcement: string | null;
}
```

#### `bettingSlice.ts`
```typescript
interface BettingState {
  chips: number;
  activeBets: BetResponse[];
  betResults: BetResultResponse[];
  odds: PlayerOdds[];
  isPlacingBet: boolean;
}
```

> **Nota**: `authSlice` e `uiSlice` esistono gia' in adklab. Non serve crearli.

### Async Thunks (`projects/betmarket/api/gameApi.ts`)

Usano `apiService` di adklab (token gia' incluso automaticamente):

```typescript
import { apiService } from '@/api/apiService';

export const startGame = createAsyncThunk('game/start',
  () => apiService.post('/game/start')
);

export const fetchGameStatus = createAsyncThunk('game/fetchStatus',
  () => apiService.get('/game/status')
);

export const executeGame = createAsyncThunk('game/execute',
  (gameId: string) => apiService.post(`/game/${gameId}/execute`)
);

export const placeBet = createAsyncThunk('betting/place',
  (bet: BetCreate) => apiService.post('/bets', bet)
);

export const fetchOdds = createAsyncThunk('betting/fetchOdds',
  (params: { participantIds: string[]; roleIds: string[] }) =>
    apiService.get(`/odds?participant_ids=${params.participantIds.join(',')}&role_ids=${params.roleIds.join(',')}`)
);

export const fetchLeaderboard = createAsyncThunk('game/leaderboard',
  () => apiService.get('/users/leaderboard')
);
```

### Polling con Redux

```typescript
// projects/betmarket/hooks/useGameSync.ts
export const useGameSync = () => {
  const dispatch = useAppDispatch();
  const gameStatus = useAppSelector(selectGameStatus);

  useEffect(() => {
    const interval = gameStatus === 'BETTING' ? 3000
                   : gameStatus === 'RESULT'  ? 5000
                   : 30000;

    const id = setInterval(() => dispatch(fetchGameStatus()), interval);
    return () => clearInterval(id);
  }, [gameStatus, dispatch]);
};
```

### Integrazione in App.tsx (adklab)

```tsx
// In App.tsx, dentro le route:
{
  path: 'betmarket/*',
  element: (
    <ProtectedRoute>
      <BetMarket />
    </ProtectedRoute>
  ),
}
```

### Cognito — Setup RBAC

Aggiungere gruppo `betmarket_user` nel Cognito User Pool di adklab. Assegnare gli utenti al gruppo per dare accesso.

### BettingModal — UI per GameState

**BETTING (timer attivo)**
```
+----------------------------------------------------+
|  $$ PLACE YOUR BETS $$              100 chip    X  |
|  [Singola] [Any Role] [Combo] [Non Esce]           |
|                                                     |
|  ⏱ 1:42 remaining                                  |
+----------------------------------------------------+
|  ┌─ MODERATOR ──────────────────── 3.5x ────────┐ |
|  │  [====-------] 28%                            │ |
|  │  ( ) Capra 3.5x  ( ) Yang 12.0x  ...         │ |
|  │  Amount: [■■■■□□□□□□] 10 chip                 │ |
|  │  Potential payout: +35 chip                   │ |
|  └───────────────────────────────────────────────┘ |
|                                                     |
|  Active bets: 1 × 10 chip                          |
+----------------------------------------------------+
```

**RESULT**
```
|  Capra → Moderator  3.5x    ✓ WON +35 chip  |  (green border)
|  Yang → Notary     12.0x    ✗ LOST -10 chip  |  (red border)
```

---

## CI/CD

### BE — `betmarket-service`

Segue il flusso standard adklab:

```
push to main
    │
    ▼
release-please → Release PR (bump versione + CHANGELOG)
    │
    ▼
Merge Release PR → GitHub Release + tag
    │
    ▼
CI workflow:
    1. Build Docker Image
    2. Run Tests (in Docker)
    3. Push to ECR
    4. Terraform Apply (deploy Lambda con nuovo image tag)
```

#### `.github/workflows/release-please.yml`
```yaml
name: Release Please

on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    outputs:
      release_created: ${{ steps.release.outputs.release_created }}
      tag_name: ${{ steps.release.outputs.tag_name }}
    steps:
      - uses: googleapis/release-please-action@v4
        id: release
        with:
          release-type: python
```

#### `.github/workflows/ci.yml`
```yaml
name: CI/CD

on:
  release:
    types: [published]

env:
  AWS_REGION: eu-west-1
  ECR_REPOSITORY: betmarket-service

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to ECR
        id: ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, Tag, Push
        run: |
          IMAGE_TAG=${{ github.event.release.tag_name }}
          docker build --target prod -t $ECR_REPOSITORY:$IMAGE_TAG .
          docker tag $ECR_REPOSITORY:$IMAGE_TAG ${{ steps.ecr.outputs.registry }}/$ECR_REPOSITORY:$IMAGE_TAG
          docker push ${{ steps.ecr.outputs.registry }}/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Terraform Apply
        working-directory: infra
        run: |
          terraform init
          terraform apply -auto-approve -var="image_tag=${{ github.event.release.tag_name }}"
```

### FE — dentro `adklab-frontend`

Il deploy FE e' gestito dal CI/CD gia' esistente di adklab-frontend. Nessuna configurazione aggiuntiva.

### Secrets da configurare

**`betmarket-service`** (BE):
| Secret | Dove |
|--------|------|
| `AWS_ACCESS_KEY_ID` | IAM user per CI/CD |
| `AWS_SECRET_ACCESS_KEY` | IAM user per CI/CD |

---

## Ordine Implementazione

### Fase 0 — Setup infra
1. Creare repo `betmarket-service` su GitHub
2. Setup Terraform (Lambda, DynamoDB, API Gateway, ECR)
3. Aggiungere gruppo `betmarket_user` in Cognito adklab
4. Configurare GitHub Secrets su `betmarket-service`
5. Setup release-please su `betmarket-service`

### Fase 1 — Backend base
6. Scaffold `betmarket-service` (struttura, Dockerfile, docker-compose, init-aws.sh)
7. PynamoDB models (single table `betmarket`)
8. Auth dependency (mock mode per dev, Cognito per prod)
9. Router `/health` + `/users/me` + `/users`
10. Router `/game/start` + `/game/status` + `/game/execute`
11. Service odds + bet evaluation
12. Router `/bets`
13. Primo deploy (ECR + Lambda + API Gateway)

### Fase 2 — Frontend (dentro adklab-frontend)
14. Creare `projects/betmarket/` (components, hooks, pages, api, types)
15. Creare slices: `gameSlice.ts` + `bettingSlice.ts` in `app/slices/`
16. Ricreare componenti **da zero** (copiare solo stili CSS/animazioni dalla slot attuale, logica tutta nuova con Redux)
17. Il repo `vibe-slot-name` resta come archivio/reference visuale
18. `projects/betmarket/api/gameApi.ts` (async thunks via `apiService`)
19. `useGameSync` hook (polling adattivo → dispatch)
20. `ChipBadge` componente
21. `GamePage.tsx` come layout principale
22. Aggiungere route `/betmarket/*` in `App.tsx` con `<ProtectedRoute>`
23. Aggiungere card BetMarket nella Home

### Fase 3 — Betting UI
24. `OddsBar` + `BetCard` componenti
25. `CountdownTimer`
26. `BettingModal`
27. CSS stili betting
28. Integrazione completa via Redux

### Fase 4 — Polish
29. Risultati nella modale (won/lost)
30. Leaderboard
31. ControlPanel read-only con chip per utente
32. Test end-to-end con 2+ utenti (Cognito + mock)

---

## Decisioni Future

- **Bancarotta forzata**: auto-assegnazione ruolo settimana successiva
- **Leaderboard avanzata**: storico settimanale, monthly reset
- **Notifiche**: push notification quando parte il timer betting
- **WebSocket**: se il polling non basta → API Gateway WebSocket
- **Auto-execute**: Lambda script schedulata che esegue lo spin se il timer scade e nessuno chiama execute

---

## Verifica

- **BE locale**: `docker compose up` → API su `localhost:8080`
- **FE locale**: `npm run dev` → app su `localhost:3000`
- **FE build**: `npx tsc --noEmit` + `npm run build`
- **E2E**: login → avvia spin → piazza bet → timer scade → verifica risultato + chip aggiornati
- **Edge cases**: bankrupt, bet su se stessi, spin senza bet, 2 utenti avviano spin contemporaneamente
- **CI/CD**: push commit → release-please PR → merge → deploy automatico
