# Wastify API Documentation 📝

## Endpoints

### 1. Google Login
- **URL:** `https://wastify-capstone-project.et.r.appspot.com/auth/google`
- **Method:** GET

### 2. Register
- **URL:** `https://wastify-capstone-project.et.r.appspot.com/auth/register`
- **Method:** POST
- **Content-Type:** x-www-form-urlencoded / raw

#### Request Body Example
```json
{
    "username": "*****",
    "email": "abc@gmail.com",
    "password": "*****" // Must be at least 8 characters
}
```

### 3. Login
- **URL:** `https://wastify-capstone-project.et.r.appspot.com/auth/login`
- **Method:** POST
- **Content-Type:** x-www-form-urlencoded / raw

#### Request Body Example
```json
{
    "email": "***@gmail.com",
    "password": "*****"
}
```

### 4. Logout
- **URL:** `https://wastify-capstone-project.et.r.appspot.com/auth/logout`
- **Method:** POST
- **Note:** Requires login to access

### 5. Get Profile
- **URL:** `https://wastify-capstone-project.et.r.appspot.com/auth/profile`
- **Method:** GET
- **Note:** Requires login to access

### 6. Edit Profile
- **URL:** `https://wastify-capstone-project.et.r.appspot.com/auth/editProfile`
- **Method:** PUT
- **Note:** Requires login to access
- **Content-Type:** form-data

#### Request Body Example
```json
{
    "username": "******",
    "email": "***@gmail.com",
    "file": file.img // File upload (e.g., profile image)
}
```

### 7. Change Password
- **URL:** `https://wastify-capstone-project.et.r.appspot.com/auth/changePassword`
- **Method:** POST
- **Note:** Requires login to access
- **Content-Type:** x-www-form-urlencoded / raw

#### Request Body Example
```json
{
    "email": "***@gmail.com",
    "oldPassword": "xxxxxxxx",
    "newPassword": "xxxxxx"
}
```

### 8. Leaderboard
- **URL:** `https://wastify-capstone-project.et.r.appspot.com/auth/leaderboard`
- **Method:** GET

### 9. Prediction
- **URL:** `https://wastify-capstone-project.et.r.appspot.com/predict`
- **Method:** POST
- **Note:** Requires login to access
- **Content-Type:** form-data

#### Request Body Example
```
image(file): xxx.png/jpg // Image file for prediction
```

### 10. Prediction Histories
- **URL:** `https://wastify-capstone-project.et.r.appspot.com/history`
- **Method:** GET
- **Note:** Requires login to access
