# auth endpointy

## POST: auth/register

### body:

```
{
    "email": "ddddd@g.pl",
    "password": "12345678"
}
```

password - Minimum 8 znaków
email - valid email

### res 200:

code dostajemy roboczo, potem będzie na maila

```
{
    "data": {
        "message": "Registration successful",
        "userId": "ca9d194ae9eea0e3764474c29f31b0e4871422f252953e23899b9327f73ecb50",
        "sessionId": "ca9d194ae9eea0e3764474c29f31b0e4871422f252953e23899b9327f73ecb50",
        "code": "84720254"
    }
}
```

Wazne sessionId + code są ważne max 10 minut, można to info gdzieś wrzucić.

### res 400:

```
{
    "message": "Name is required",
    "key": "validation_error"
}
```

### res 409:

```
{
    "message": "Account already exists in the database",
    "key": "RECORD_ALREADY_EXISTS"
}
```

### res: 500:

```
{
    "message": "Internal server error",
    "key": "internal_server_error"
}
```

## POST: auth/verify-email

### body:

```
{
    "email": "a@g.pl",
        "sessionId": "ca9d194ae9eea0e3764474c29f31b0e4871422f252953e23899b9327f73ecb50",
        "code": "84720254"
}
```

### res 200:

Dostajemy tutaj cookiesa z sesją dodatkowo

```
{
    "data": {
        "message": "Code verified successfully",
        "userId": "ee1623be-cad7-4372-a4eb-eeedbb7823ef"
    }
}
```

### res 401:

```
{
    "message": "Invalid verification code or session",
    "key": "invalid_verification_code"
}
```

### res: 500:

```
{
    "message": "Internal server error",
    "key": "internal_server_error"
}
```

## POST: auth/resend-verification-code

### body

```
{
    "email": "aa@g.pl"
}
```

### res 200:

Tak samo, na razie code roboczo tutaj.

```
{
    "data": {
        "message": "Verification code resent successfully",
        "code": "xXId0LRS",
        "sessionId": "6c4dda373efe61f3012ae643a95c8fd09f0a068fe358e3cd6fc62e81f0c13091"
    }
}
```

### res 404:

```
{
    "message": "User not found",
    "key": "user_not_found"
}
```

### res 400:

```
{
    "message": "Name is required",
    "key": "validation_error"
}
```

### res 400:

```
{
    "message": "User already verified",
    "key": "user_already_verified"
}
```

## auth/login

### body:

```
{
    "email": "ddd@g.pl",
    "password": "12345678"
}
```

## res 200:

Dodatkowo dostajemy cookiesa

```
{
    "data": {
        "message": "Login successful",
        "userId": "c1e04fe0-a8c8-4c1b-a705-6bb73a08271f"
    }
}
```

## res 401:

```
{
    "message": "Provided credentials are invalid",
    "key": "WRONG_CREDENTIALS"
}
```

## res 401:

```
{
    "message": "Email not verified",
    "key": "email_not_verified"
}
```

## robocz auth/test-auth

### body: Nieistotne

### res 200: Jeżeli mamy cookiesa poprawnego

### res 401: Jeżeli nie





# deck endpointy

## POST deck/create

### body:
```
{
    "title":"edisted",
    "description": "test"
}
```

## res 200:
```
data: {
    "title": "edisted",
    "description": "test",
    "owner": {
        "id": "c1e04fe0-a8c8-4c1b-a705-6bb73a08271f"
    },
    "id": "b42396a9-92fd-4358-9075-8e2e11b7192e",
    "createdAt": "2025-11-04T15:30:37.732Z",
    "updatedAt": "2025-11-04T15:30:37.732Z"
}
```

## PUT deck/:id

### body - Takie samo jak create ale pola opcjonalne.

## res 200:
```
data: {
    "id": "b42396a9-92fd-4358-9075-8e2e11b7192e",
    "title": "edisted",
    "description": "test",
    "createdAt": "2025-11-04T15:30:37.732Z",
    "updatedAt": "2025-11-04T15:30:37.732Z"
}
```

## DELETE deck/:id

### body: brak
### res 200 body: brak


## GET /deck

### res 200:
```
data: [
    {
        "id": "e02cbb76-581d-4a09-8566-f47b142edcad",
        "title": "edisted",
        "description": "test12321",
        "createdAt": "2025-11-04T15:02:40.124Z",
        "updatedAt": "2025-11-04T15:02:40.124Z"
    }
]
```

## GET deck/:id

### res 200:
```
data: {
    "id": "e02cbb76-581d-4a09-8566-f47b142edcad",
    "title": "edisted",
    "description": "test12321",
    "createdAt": "2025-11-04T15:02:40.124Z",
    "updatedAt": "2025-11-04T15:02:40.124Z"
}
```

## POST /deck/:id/cards

### body
```
{
  "cards": [
    {
      "text": "What is the capital of France?",
      "type": "white"
    },
    {
      "text": "Fill in the blank: The Eiffel Tower is in _____",
      "type": "black",
      "blankSpaceAmount": 1
    },
    {
      "text": "Another blank question: _____ and _____",
      "type": "black",
      "blankSpaceAmount": 2
    }
  ]
}
```

### res 200:
```
data: [
    {
        "text": "What is the capital of France?",
        "type": "white",
        "deck": {
            "id": "e02cbb76-581d-4a09-8566-f47b142edcad"
        },
        "blankSpaceAmount": null,
        "id": "6ee5b44d-462e-41ab-bcbf-0c645696f98e",
        "createdAt": "2025-11-04T22:17:26.346Z",
        "updatedAt": "2025-11-04T22:17:26.346Z"
    },
    {
        "text": "Fill in the blank: The Eiffel Tower is in _____",
        "blankSpaceAmount": 1,
        "type": "black",
        "deck": {
            "id": "e02cbb76-581d-4a09-8566-f47b142edcad"
        },
        "id": "4fe19ca5-4c41-4dfa-920f-d3f55b9c34f1",
        "createdAt": "2025-11-04T22:17:26.346Z",
        "updatedAt": "2025-11-04T22:17:26.346Z"
    },
    {
        "text": "Another blank question: _____ and _____",
        "blankSpaceAmount": 2,
        "type": "black",
        "deck": {
            "id": "e02cbb76-581d-4a09-8566-f47b142edcad"
        },
        "id": "a1e45737-5076-4588-a865-ff6d8317f303",
        "createdAt": "2025-11-04T22:17:26.346Z",
        "updatedAt": "2025-11-04T22:17:26.346Z"
    }
]
```

## DELETE /deck/:id/cards

### body
```
{
  "cardIds": ["17d38989-494a-4910-bae2-0fd76d8dbec5"]
}
```

### res 200 body - brak

## GET /deck/:id/cards

### query params:
- page
- pageSize
- cardType -> white/black

### res 200
```
{
    "data": [
        {
            "id": "6ee5b44d-462e-41ab-bcbf-0c645696f98e",
            "text": "What is the capital of France?",
            "blankSpaceAmount": null,
            "type": "white",
            "createdAt": "2025-11-04T22:17:26.346Z",
            "updatedAt": "2025-11-04T22:17:26.346Z"
        },
        {
            "id": "ff1b9d20-e64f-4f97-9891-2faceb3d4fee",
            "text": "What is the capital of France?",
            "blankSpaceAmount": 1,
            "type": "white",
            "createdAt": "2025-11-04T21:38:33.521Z",
            "updatedAt": "2025-11-04T21:38:33.521Z"
        }
    ],
    "total": 2,
    "page": 0,
    "pageSize": 10
}
```