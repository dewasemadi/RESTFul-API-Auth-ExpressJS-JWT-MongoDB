## Authentication & Authorization ExpressJS Using JWT

![Screenshot from 2021-12-27 22-16-07](https://user-images.githubusercontent.com/66185022/147479929-150f9e31-8bac-4ff5-9794-2315de864bff.png)

> After clone this project, create your own .env file for environment variables in root project

```bash
NODE_ENV = <your node env>

CLIENT_BASE_URL = <your client base url>
SERVER_BASE_URL = <your server base url>
MONGO_URI = <your mongo uri>

ACCESS_TOKEN_SECRET = <your access token secret>
REFRESH_TOKEN_SECRET = <your refresh token secret>

EMAIL_SENDER = <your email sender name>
AUTH_EMAIL = <your email>
AUTH_EMAIL_PASSWORD = <your email password>

GOOGLE_CLIENT_ID = <your client id>
GOOGLE_CLIENT_SECRET = <your client secret>
```

### Tech Stack and Tools

- Express JS
- MongoDB & MongoDB Compass (client)
- Postman
- Linux (Zorin OS)

### Manual Authentication Endpoints

| Method | Endpoints                                | Payload                                                 | Description                                                                                |
| :----- | :--------------------------------------- | :------------------------------------------------------ | :----------------------------------------------------------------------------------------- |
| POST   | /auth/register                           | {name, email, password}                                 | Register new user and store it into mongoDB                                                |
| POST   | /auth/login                              | {email, password}                                       | Authenticate user                                                                          |
| POST   | /auth/reset-password-link                | {email}                                                 | When user forgot their password, they can request reset password link and send it to gmail |
| POST   | /auth/reset-password?token={{token}}     | {new_password, new_password_confirmation}               | Generate new password                                                                      |
| PUT    | /auth/change-password                    | {old_password, new_password, new_password_confirmation} | Change password when user authenticated                                                    |
| POST   | /auth/email-verification                 | {email}                                                 | When the email verification token is invalid, user can request new email verification link |
| GET    | /auth/email-verification?token={{token}} | -                                                       | Verify user email                                                                          |
| GET    | /auth/logout                             | -                                                       | Kick user from our system                                                                  |
| GET    | /auth /generate-access-token             | -                                                       | When access token is expired, user can request a new access token using refresh token      |

### Authentication with Gogleapis Service Endpoints

| Method | Endpoints             | Payload | Description                              |
| :----- | :-------------------- | :------ | :--------------------------------------- |
| GET    | /auth/google/url      | -       | Generate authorization URL               |
| GET    | /auth/google/callback | -       | Callback for retrieve authorization code |
| GET    | /auth/google          | -       | Get google information profile           |

### Features:

- Input validation
- Implements access token and refresh token with JWT
- SMTP to send token to user email for verify email and reset password
- Login with google
- oauth2

### Software Architecture and Flow

#### ERD

![ERD auth](https://user-images.githubusercontent.com/66185022/147479010-e13437a3-40cf-4fba-9a0e-d8879d5b0dbe.jpg)

#### Rest API Architecture

![Rest API Architecture](https://user-images.githubusercontent.com/66185022/147479146-28d3af7f-180c-4f98-9bb9-807f0159a289.jpg)

#### Access Token and Refresh Token JWT Flow

![access token and refresh token flow-Page-1](https://user-images.githubusercontent.com/66185022/147512980-2b69e160-d1cb-47c0-b6cb-864bf623cf24.jpg)

#### Login or Sign Up with Google

![google oauth](https://user-images.githubusercontent.com/66185022/147479433-db925d5c-1830-42bd-9b9e-ae72dbde037c.png)

#### Showcase Project

![Screenshot from 2021-12-27 22-16-52](https://user-images.githubusercontent.com/66185022/147479990-09cb5a1c-0b20-4055-b956-ce97762fdaa6.png)

![Screenshot from 2021-12-27 22-20-11](https://user-images.githubusercontent.com/66185022/147480274-9a5a6974-37df-4293-b009-ce25d5ebd087.png)
