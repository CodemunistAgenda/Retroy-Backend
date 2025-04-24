# Retroy backend

https://www.npmjs.com/package/disposable-email-blocker

├── bun.lock
├── index.html
├── main.js
├── package.json
├── package-lock.json
├── payment.guide.md
├── README.md
├── Retroy API Tests.postman_collection.json

    <!-- Routedatei -->

├── server.ts
├── src
│ ├── config
│ │ └── connect.ts
│ ├── controllers
│ │ ├── Admin
│ │ │ ├── admin.clean.controller.ts
│ │ │ ├── admin.order.controller.ts
│ │ │ ├── admin.product.controller.ts
│ │ │ ├── admin.user.controller.ts
│ │ │ └── admin.whitelist.controlller.ts
│ │ ├── admin.controller.ts
│ │ ├── auth.controller.ts
│ │ ├── cart.controller.ts
│ │ ├── order.controller.ts
│ │ ├── product.controller.ts
│ │ ├── profile.controller.ts
│ │ ├── userController.ts
│ │ └── verifyUser.ts
│ ├── data
│ │ └── product.json
│ ├── middleware
│ │ ├── address.validation.ts
│ │ ├── Admin
│ │ │ ├── product.middleware.ts
│ │ │ └── update.users.middleware.ts
│ │ ├── admin.only.ts
│ │ ├── cart.middleware.ts
│ │ ├── jwtAuth.ts
│ │ ├── order.middleware.ts
│ │ ├── profile.middleware.ts
│ │ ├── reCaptcha.ts
│ │ ├── sendingMails.ts
│ │ └── uploads.ts
│ ├── models
│ │ ├── address.model.ts
│ │ ├── cart.model.ts
│ │ ├── order.model.ts
│ │ ├── personalData.model.ts
│ │ ├── product.model.ts
│ │ ├── user.model.ts
│ │ └── whileList.model.ts
│ ├── routes
│ │ ├── Admin
│ │ │ ├── admin.clean.routes.ts
│ │ │ ├── admin.index.ts
│ │ │ ├── admin.order.routes.ts
│ │ │ ├── admin.product.routes.ts
│ │ │ ├── admin.profile.routes.ts
│ │ │ ├── admin.user.routes.ts
│ │ │ └── admin.whiteList.routes.ts
│ │ ├── auth.routes.ts
│ │ ├── cart.routes.ts
│ │ ├── index.ts
│ │ ├── order.routes.ts
│ │ ├── product.routes.ts
│ │ └── profile.routes.ts
│ ├── services
│ ├── types
│ │ └── express
│ │ └── index.d.ts
│ └── utils
│ ├── cloudinary.cleaner.ts
│ ├── cloudinary.ts
│ ├── encription.helper.ts
│ ├── examples.ts
│ ├── helper.function.ts
│ ├── regex.ts
│ └── tempmailing.ts
