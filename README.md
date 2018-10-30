# Auction Management System with Online Bidding

Auction Management System with Online Bidding is Management System created for Auction Pride of the Philippines Inc.
It is consists of three (3) portals:

* Consignor Portal - A portal for consignors to monitor their consigned assets.
* Auction Management Portal - Portal for the company staff, to manage consignor and bidder registration, to create an auction schedule, to manipulate inventory asset, to appraise assets.
* Online Bidding Portal - A portal for bidder to bid anywhere they like.

## Features/Functionalities

### Mandatory Features/Functionalities
The following are the mandatory features/functionalities of the project:

#### Consignor Portal

* Consignor Registration
* Creating Consignment
* Consignment Monitoring
* Consignment Reports

#### Auction Management Portal

* Asset Receiving
* Asset Appraisal
* Asset Adjustment
* Asset Maintenance
* Auction Scheduling
* Auction Maintenance
* Consignor Evaluation
* Bidder Evaluation
* Bidder Verification
* Consignor and Bidder Maintenance
* Employee Access
* Award Maintenance
* Sales Transaction

#### Online Bidding Portal

* Bidder Registration
* Bidder Registration Fee Payment
* Online Bidding
* Awards Viewing
* Awards Payment
* Award Tracking


### Additional Features
The following are the additional features/functionalities* of the project:

* Real-time monitoring of assets and online bidding using [Socket.io.](https://socket.io/)
* Asset Appraisal using [Multivariate Regression Analysis](https://www.npmjs.com/package/ml-regression-multivariate-linear)
* Online Payment Solution using [Paymaya SDK.](https://developers.paymaya.com)
* Sales Revenue Forecasting and Asset Trend Analysis using [Exponential Moving-Average Time-Series Analysis.](https://www.npmjs.com/package/moving-average)
* QR-code Technology for consignment and auction result receipt code using [Instascan.](https://github.com/schmich/instascan)

## Getting Started

### Installing

1. Fork this repository. The fork button should be at the upper right of this page. Fork it to your personal GitHub profiles. By doing so, you'll have a copy of this project in your respective profiles. To check, your URL should be like this: `https://github.com/your_username/AMSOB`

2. After forking, clone it to your local machines. Forking gives you ownership to the copy of the project, thus you'll have automatic read and write (pull and push) privileges. No need to authenticate through your professor as long as you have configured your SSH keys.

3. After cloning, open a command line (terminal) and go to the boilerplate directory. Issue an `npm install` command. This will download module dependencies of the project. **Note that this requires a working internet connection**.

4. After installing all the dependencies, open the `.env.sample` file and copy the contents of it. Create a new `.env` file and paste everything in there. The sample file has comments in it for each field present.

5. Run the **AMSOBDatabase.sql** on your [MySQL workbench]() or any SQL Management System, then configure the credential on the `.env` file.

5. Run the application using `node index.js` or `nodemon` if you have installed it (`npm install nodemon -g`).

### Built With

* [ExpressJS](https://expressjs.com/) - Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
* [PUG](https://pugjs.org/api/getting-started.html) - Pug is a high-performance template engine heavily influenced by Haml and implemented with JavaScript for Node.js and browsers.
* [MySQL](https://www.npmjs.com/package/mysql) - MySQL Node is a node.js driver for mysql. It is written in JavaScript, does not require compiling, and is 100% MIT licensed.
* [Socket.io](https://socket.io/) - Socket.IO is a library that enables real-time, bidirectional and event-based communication between the browser and the server.
* [Nodemailer](https://nodemailer.com/) - Nodemailer is a module for Node.js applications to allow easy as cake email sending.
* [Paymaya Node SDK](https://developers.paymaya.com/) - PayMaya offers two integration options into our payment gateway platform: via our PayMaya Checkout (Online Payment Page) or PayMaya Payment Vault (Tokenization and Card Vault).
* [jQuery](https://jquery.com/) - jQuery is a fast, small, and feature-rich JavaScript library. It makes things like HTML document traversal and manipulation, event handling, animation, and Ajax much simpler with an easy-to-use API that works across a multitude of browsers. With a combination of versatility and extensibility, jQuery has changed the way that millions of people write JavaScript.

## Authors

* **Froilan Sam Malibiran** - [froilansam](https://github.com/froilansam)
* **Gramar Lacsina** - [lacsinagramar](https://github.com/lacsinagramar)

See also the list of [contributors](https://github.com/AMSOB/contributors) who participated in this project.

## Note: 

* This is a capstone project, a requirement for the course CAPSTONE subject in **Polytechnic University of the Philippines**.
* *Additional Features/Functionalities are the features/functionalities that is not a must-have for the requirement matrix of the project.