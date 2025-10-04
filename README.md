#  Quiztopia API

Quiztopia är ett serverless REST API för att skapa, hantera och spela quiz. 
Projektet är byggt med AWS Lambda, DynamoDB och Serverless Framework, med JWT-baserad autentisering och fullständig testautomation via Postman Flows.

---

##  Funktioner

-  Registrering & inloggning med JWT
-  Skapa quiz med frågor och svarsalternativ
-  Skicka in resultat och visa leaderboard
-  Automatisk rensning av testdata via DELETE
-  Postman för testning

---

## 🛠 Teknisk stack

| Teknologi         | Användning                        |
|-------------------|-----------------------------------|
| AWS Lambda        | Backend-funktioner                |
| DynamoDB          | Databas för användare, quiz & resultat |
| API Gateway       | REST-endpoints                    |
| Serverless Framework | Infrastruktur & deploy         |
| Postman           | API-testning & automatisering     |
| JWT               | Autentisering                     |
| Middy             | Middleware-hantering              |

---

 ## Installation

```bash
git clone https://github.com/Kentska/Quiztopia-Api-exam.git
cd Quiztopia-Api-exam
npm install
Skapa en .env-fil i projektroten:
JWT_SECRET=din-superhemliga-nyckel

## Deploy
För att deploya projektet till AWS Lambda:
npm run deploy
Se till att du har serverless-dotenv-plugin installerad och useDotenv: true i serverless.yml.

Autentisering
Alla skyddade endpoints kräver en Authorization: Bearer <token>-header. Token genereras vid inloggning och används för att identifiera användaren i varje request.

📚 API-endpoints

🧑‍💻 Auth
POST /auth/register
POST /auth/login

🧩 Quiz
POST /quizzes/create
GET /quizzes
GET /quizzes/{quizId}
DELETE /quizzes/{quizId}
POST /quizzes/{quizId}/questions

🏁 Resultat

POST /scores/submit
GET /leaderboard?quizId={quizId}

📁 Projektstruktur

src/
├── functions/
│   ├── auth/
│   ├── quizzes/
│   └── scores/
├── middleware/
│   └── verifyToken.js
serverless.yml
.env

🧠 Att tänka på
Alla quiz och resultat är kopplade till quizId

Leaderboard hämtar topp 10 via quizId-index i DynamoDB

JWT måste skickas med i varje skyddad request

.env krävs för att deploy ska fungera korrekt


## 🧪 Postman Collection

För snabb testning, importera vår Postman-samling:

📁 [Ladda ner quiztopia-postman-collection.json](./quiztopia-postman-collection.json)

**Så här importerar du:**

1. Öppna Postman
2. Klicka på **Import**
3. Välj filen `quiztopia-postman-collection.json`
4. Gå till fliken **Variables** och uppdatera `baseUrl` till din API Gateway URL

> Samlingen innehåller alla endpoints, JWT-token sparas automatiskt, och quizId hanteras via variabler.


👨‍💻 Utvecklare
Byggt av Kent — med fokus på serverless och säkerhet.



