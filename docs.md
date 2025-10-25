# auth endpointy

## POST: auth/register

### body:

`{
    "email": "ddddd@g.pl",
    "password": "12345678"
}`

password - Minimum 8 znaków
email - valid email

### res 200:

code dostajemy roboczo, potem będzie na maila

`{
    "data": {
        "message": "Registration successful",
        "userId": "ca9d194ae9eea0e3764474c29f31b0e4871422f252953e23899b9327f73ecb50",
        "sessionId": "ca9d194ae9eea0e3764474c29f31b0e4871422f252953e23899b9327f73ecb50",
        "code": "84720254"
    }
}`

Wazne sessionId + code są ważne max 10 minut, można to info gdzieś wrzucić.

### res 400:

`{
    "message": "Name is required",
    "key": "validation_error"
}`

### res 409:

`{
    "message": "Account already exists in the database",
    "key": "RECORD_ALREADY_EXISTS"
}`

### res: 500:

`{
    "message": "Internal server error",
    "key": "internal_server_error"
}`

## POST: auth/verify-email

### body:

`{
    "email": "a@g.pl",
        "sessionId": "ca9d194ae9eea0e3764474c29f31b0e4871422f252953e23899b9327f73ecb50",
        "code": "84720254"
}`

### res 200:

Dostajemy tutaj cookiesa z sesją dodatkowo

`{
    "data": {
        "message": "Code verified successfully",
        "userId": "ee1623be-cad7-4372-a4eb-eeedbb7823ef"
        "user": {
            "name": string
            "customUsername": boolean
            "email": string
        }
    }
}`

### res 401:

`{
    "message": "Invalid verification code or session",
    "key": "invalid_verification_code"
}`

### res: 500:

`{
    "message": "Internal server error",
    "key": "internal_server_error"
}`

## POST: auth/resend-verification-code

### body

`{
    "email": "aa@g.pl"
}`

### res 200:

Tak samo, na razie code roboczo tutaj.

`{
    "data": {
        "message": "Verification code resent successfully",
        "code": "xXId0LRS",
        "sessionId": "6c4dda373efe61f3012ae643a95c8fd09f0a068fe358e3cd6fc62e81f0c13091"
    }
}`

### res 404:

`{
    "message": "User not found",
    "key": "user_not_found"
}`

### res 400:

`{
    "message": "Name is required",
    "key": "validation_error"
}`

### res 400:

`{
    "message": "User already verified",
    "key": "user_already_verified"
}`

## auth/login

### body:

`{
    "email": "ddd@g.pl",
    "password": "12345678"
}`

## res 200:

Dodatkowo dostajemy cookiesa

`{
    "data": {
        "message": "Login successful",
        "userId": "c1e04fe0-a8c8-4c1b-a705-6bb73a08271f",
        "user": {
            "name": string
            "customUsername": boolean
            "email": string
        }
    }
}`

## res 401:

`{
    "message": "Provided credentials are invalid",
    "key": "WRONG_CREDENTIALS"
}`

## res 401:

`{
    "message": "Email not verified",
    "key": "email_not_verified"
}`

## auth/logout
Usuwa cookiesa i czyści sesje, trzeba być zalogowanym

## auth/set-nickname

### body: 
`
{
    username: min(3) max(15) alfanumeryczne i podłogi
}
`

### res 200
`
{
    "user": {
    "name": string
    "customUsername": boolean
    "email": string
    }
}
`

### Błędy standardowe jak wszędzie

## robocz auth/test-auth

### body: Nieistotne

### res 200: Jeżeli mamy cookiesa poprawnego

### res 401: Jeżeli nie
