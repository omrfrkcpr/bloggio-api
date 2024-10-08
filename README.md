<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

<div align="center">

[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

</div>

[contributors-shield]: https://img.shields.io/github/contributors/omrfrkcpr/bloggio-api.svg?style=flat-square&color=blue
[contributors-url]: https://github.com/omrfrkcpr/bloggio-api/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/omrfrkcpr/bloggio-api.svg?style=flat-square&color=blueviolet
[forks-url]: https://github.com/omrfrkcpr/bloggio-api/network/members
[stars-shield]: https://img.shields.io/github/stars/omrfrkcpr/bloggio-api.svg?style=flat-square&color=brightgreen
[stars-url]: https://github.com/omrfrkcpr/bloggio-api/stargazers
[issues-shield]: https://img.shields.io/github/issues/omrfrkcpr/bloggio-api.svg?style=flat-square&color=red
[issues-url]: https://github.com/omrfrkcpr/bloggio-api/issues
[license-shield]: https://img.shields.io/github/license/omrfrkcpr/bloggio-api.svg?style=flat-square&color=yellow
[license-url]: https://github.com/omrfrkcpr/bloggio-api/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&color=blue
[linkedin-url]: https://linkedin.com/in/omrfrkcpr

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/omrfrkcpr/bloggio-api">
    <img src="https://bloggio.s3.eu-north-1.amazonaws.com/bloggio-assets/bloggio-api.png" alt="Logo" width="100" height="100">
  </a>

<h3 align="center">Bloggio API</h3>

  <p align="center">
    The backend API for the Bloggio project. It provides RESTful endpoints to manage blogs, users, categories, auth tokens and other related data. Built with Node.js and Express.js, it ensures efficient data handling and secure user authentication.
    <br />
    <br />
    <a href="https://github.com/omrfrkcpr/bloggio-api"><strong>Explore the docs »</strong></a>
    <br />
    <a href="https://github.com/omrfrkcpr/bloggio"><strong>Bloggio App »</strong></a>
    <br />
    <br />
    <a href="https://bloggio-api.onrender.com/">View</a>
    ·
    <a href="https://github.com/omrfrkcpr/bloggio-api/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/omrfrkcpr/bloggio-api/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#erd">ERD</a></li>
        <li><a href="#authentication-process">Authentication Process</a></li>
      </ul>
    </li>
    <li><a href="#structure">Structure</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#components">Components</a></li>
    <li><a href="#technical">Technical</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

<!-- AUTHENTICATION PROCESS -->

### Built With

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=nodejs,express,mongodb,js,docker,aws,npm,postman" />
  </a>
</p>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ERD - Entity-Relationship Diagram  -->

### ERD

![ERD](https://bloggio.s3.eu-north-1.amazonaws.com/bloggio-assets/bloggio-erd.png)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- AUTHENTICATION PROCESS -->

### Authentication Process

This project implements a comprehensive authentication system using the following technologies: Node.js, Express.js, JWT, Simple Token, MongoDB, Mongoose, Passport.js, Session, Nodemailer, and AWS-S3. Below is a detailed overview of the authentication process:

#### User Registration and Verification

1. **User Registration**:

   - Users fill out a registration form on the web/mobile application.
   - The backend server receives the user data and encrypts the password using a hashing algorithm.
   - The encrypted user data is saved to MongoDB.

2. **Email Verification**:
   - An email verification link is sent to the user's email address using Nodemailer.
   - Users must click the verification link to activate their account.
   - The backend server verifies the token from the link and activates the user account.

#### Social Media Login

1. **OAuth Login**:
   - Users can log in using their Google accounts via Passport.js.
   - Passport.js handles the OAuth flow and retrieves user data from the social media platform.
   - If the user does not exist in the database, a new user is created with the retrieved data.
   - User session data is stored using express-session.

#### Login and Token Management

1. **User Login**:

   - Users can log in manually with their credentials or through social media accounts.
   - Upon successful login, the backend server generates a Simple Token and JWT (access and refresh tokens).

2. **Token Usage**:
   - The JWT allows users to access protected routes and perform authorized actions within the application.
   - The session duration is set to 1 day. If needed, the access token can be refreshed using the refresh token to extend the session by another 1 day.
   - If the session expires without token refresh, users are redirected to the login page to re-authenticate.

#### Password Security

- When creating an account, user passwords are securely hashed before storing in the database to ensure confidentiality.

#### Avatar Management

1. **Social Media Avatars**:

   - When users log in through social media, their avatar URL is automatically fetched and stored.

2. **Manual Avatar Upload**:
   - Users can manually upload their avatar photos, which are then stored in AWS-S3.
   - The URL of the uploaded avatar is saved in the database.

#### Visual Diagram

To better understand the authentication flow, here is a visual representation:

<!-- Add your visual diagram link or embed it here -->

![Bloggio-Auth-Diagramm](https://bloggio.s3.eu-north-1.amazonaws.com/bloggio-assets/bloggio-auth.png)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- STRUCTURE -->

## Structure

```
bloggio-api
  ├── logs
  ├── src/
  |     ├── configs
  |     |     ├── email/
  |     |     ├── passportjs-auth
  |     |     ├── dbConnection.js
  |     |     └── swagger.json
  |     ├── controllers
  |     |     ├── auth.js
  |     |     ├── blog.js
  |     |     ├── category.js
  |     |     ├── comment.js
  |     |     ├── subCategory.js
  |     |     ├── token.js
  |     |     └── user.js
  |     ├── controllers
  |     |     └── customError.js
  |     ├── helpers
  |     |     ├── convertHtmlToText.js
  |     |     ├── deleteObjectByKeyNumberS3Bucket.js
  |     |     ├── extractDateNumber.js
  |     |     ├── passwordEncryption.js
  |     |     ├── tokenGenerator.js
  |     |     └── userValidator.js
  |     ├── middlewares
  |     |     ├── authentication.js
  |     |     ├── awsS3Upload.js
  |     |     ├── checkVisitSession.js
  |     |     ├── errorHandler.js
  |     |     ├── idValidation.js
  |     |     ├── logger.js
  |     |     ├── permissions.js
  |     |     ├── queryHandler.js
  |     |     └── rateLimiters.js
  |     ├── models
  |     |     ├── blog.js
  |     |     ├── category.js
  |     |     ├── comment.js
  |     |     ├── subCategory.js
  |     |     ├── token.js
  |     |     ├── tokenBlacklist.js
  |     |     ├── tokenVerification.js
  |     |     └── user.js
  |     ├── routers
  |     |     ├── auth.js
  |     |     ├── blog.js
  |     |     ├── category.js
  |     |     ├── comment.js
  |     |     ├── document.js
  |     |     ├── index.js
  |     |     ├── subCategory.js
  |     |     ├── token.js
  |     |     └── user.js
  |     └── utils
  |           ├── email
  |           |     ├── feedback
  |           |     |      ├── feedback.html
  |           |     |      └── feedback.js
  |           |     ├── forgot
  |           |     |      ├── forgotPassword.html
  |           |     |      └── forgotPassword.js
  |           |     ├── reset
  |           |     |      ├── resetPassword.html
  |           |     |      └── resetPassword.js
  |           |     ├── welcome
  |           |     |      ├── welcomeEmail.html
  |           |     |      └── welcomeEmail.js
  |           |     └── emailService.js
  |           └── functions.js
  ├── .dockerignore
  ├── .gitignore
  ├── .sample-env
  ├── constants.js
  ├── dockerfile
  ├── bloggio-auth.png
  ├── bloggio-erd.png
  ├── index.js
  ├── LICENSE
  ├── package-lock.json
  ├── package.json
  ├── README.md    // Project documentation
  └── swaggerAutogen.js
```

See the [open issues](https://github.com/omrfrkcpr/bloggio-api/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FEATURES -->

## Features

CRUD Operations:

- Create: Add new blog with detailed information such as name, description, dueDates....
- Read: Retrieve information about single blog, either all at once or individually by ID.
- Update: Modify the details of existing blog.
- Delete: Remove blog from the collection.

MVC Architecture:

- Model: Defines the structure of the blog data and interacts with the MongoDb database using Mongoose ODM.
- View: Though typically associated with frontend, in this context, it refers to the response sent back to the client.
- Controller: Handles incoming requests, processes data using models, and returns the appropriate responses.

Database Management:

- Utilizes MongoDB for non-relational database, server-side storage.
- Mongoose ODM provides an easy-to-use interface for database operations, enabling complex queries and relationships.

Routing:

- Express.js handles routing, directing API requests to the appropriate controllers.
- Organized routes for handling blog-related operations.

Error Handling:

- Robust error handling to manage invalid inputs, missing data, and other potential issues.
- Custom error messages to guide users and developers.

Middleware:

- Utilizes Express middleware for parsing request bodies, handling JSON data, and managing static files.
- Passportjs middleware for authenticating with Google accounts

Session Management:

- Retrieve user data from Google and save in Mongodb collection with using Connect-Mongo (Passportjs)

Tools and Technologies:

- Postman is used for API testing, ensuring that all endpoints are functioning correctly and efficiently.
  The application is hosted on Render, a reliable hosting service that ensures high availability and performance.
- Docker is used for running application serverless with container
- DrawSQL is used for creating an ERD for project.

Deployment:

- The project is deployed on Render, allowing for easy access and scalability. Vercel and Render's platforms provide automatic builds and deployments, making the development process smoother.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- COMPONENTS -->

## Components

Models:

- Defined using Mongoose to represent the data structures.
- Models (Blog, Category, SubCategory, Comment, User and Token) include fields for details.
- Associations and validations ensure data integrity and consistency.

Controllers:

- Contain the logic for handling CRUD operations.
- Interact with Mongoose models to perform database operations.
- Return JSON responses to the client, containing data or error messages as appropriate.

Routes:

- Defined in Express to handle API endpoints.
- Routes map to controller actions for creating, reading, updating, and deleting blogs.

Example endpoints:

- POST /blogs - Create a new blog.
- GET /blogs - Retrieve all blogs.
- GET /blogs/:id - Retrieve a specific blog by ID.
- PUT /blogs/:id - Update a blog by ID.
- PATCH /blogs/:id - Update a blog by ID.
- DELETE /blogs/:id - Delete a blog by ID.

For more endpoints check out [Swagger Document](https://bloggio-api.onrender.com/documents/swagger/)

Middleware:

- Used to parse incoming request bodies (e.g., express.json()).
- Additional middleware can be added for authentication, logging, permissions and limiters etc.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TECHNICAL -->

## Technical

Frontend:

- React: A JavaScript library for building user interfaces.
- TypeScript: A statically typed superset of JavaScript.
- TailwindCSS: A utility-first CSS framework for rapid UI development.
- Redux & Toolkit: For managing state across the application.
- Cypress: For E2E Testing

Backend:

- Node.js: A JavaScript runtime built on Chrome's V8 engine.
- Express.js: A minimal and flexible Node.js web application framework.
- MongoDb: A document database used to build highly available and scalable internet applications.
- Mongoose: An ODM (Object Data Modeling) library for MongoDB, provides a straight-forward, schema-based solution to model your application data
- JWT: JSON Web Token (JWT) is a compact URL-safe means of representing claims to be transferred between two parties
- Passportjs: A popular middleware for Node. js that simplifies the process of implementing authentication and authorization in web apps
- Docker: A platform designed to help developers build, share, and run container applications.
- AWS-S3: Amazon Simple Storage Service (Amazon S3) is an object storage service offering industry-leading scalability, data availability, security, and performance.
- Nodemailer: A Node JS module that allows you to send emails from your server easily.

Tools:

- Postman: An API client for testing and developing APIs.
- DrawSQL: Helps dev teams create beautiful schema diagrams to document their database entity relationships (ERD: Entity-Relationship Diagram)
- Render: A cloud platform for hosting web applications. (backend)
- Vercel: A cloud plattform for hosting web applications. (frontend)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See [LICENSE.txt](https://github.com/omrfrkcpr/bloggio-api/blob/main/LICENSE) for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

[Support](omerrfarukcapur@gmail.com)<br />

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- [APP](https://bloggio.de)<br />
- [APP-Repo](https://github.com/omrfrkcpr/bloggio)<br />
- [API](https://bloggio-api.onrender.com/)<br />
- [API-Repo](https://github.com/omrfrkcpr/bloggio-api)<br />
- [Dockerhub]()<br />
- [postman-docs]()

<p align="right">(<a href="#readme-top">back to top</a>)</p>
