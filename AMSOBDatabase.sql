CREATE DATABASE  IF NOT EXISTS `apptradev7` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `apptradev7`;
-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: apptradev7
-- ------------------------------------------------------
-- Server version	5.7.17-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tbl_address_book`
--

DROP TABLE IF EXISTS `tbl_address_book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_address_book` (
  `intAddressBookID` int(11) NOT NULL AUTO_INCREMENT,
  `strHouseAddress` varchar(200) NOT NULL,
  `strBarangay` varchar(45) NOT NULL,
  `strCity` varchar(45) NOT NULL,
  `strRegion` varchar(45) NOT NULL,
  `strPostcode` varchar(45) NOT NULL,
  `strFullname` varchar(45) NOT NULL,
  `strPhoneNumber` varchar(45) NOT NULL,
  `strOthernotes` varchar(45) DEFAULT NULL,
  `intABBidderID` int(11) NOT NULL,
  `booDefault` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`intAddressBookID`),
  KEY `intABBidderID_idx` (`intABBidderID`),
  CONSTRAINT `intABBidderID` FOREIGN KEY (`intABBidderID`) REFERENCES `tbl_bidder` (`intBidderID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_address_book`
--

LOCK TABLES `tbl_address_book` WRITE;
/*!40000 ALTER TABLE `tbl_address_book` DISABLE KEYS */;
INSERT INTO `tbl_address_book` VALUES (26,'Lot 21 Block 13, 13th Avenue, Suburbia East Subd., Parang','Parang','Marikina City','NCR','1809','Froilan Sam','999-999','',77,1);
/*!40000 ALTER TABLE `tbl_address_book` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_ai_status_history`
--

DROP TABLE IF EXISTS `tbl_ai_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_ai_status_history` (
  `intAIStatusID` int(12) NOT NULL,
  `datDateChange` date DEFAULT NULL,
  `intStaffID` int(11) DEFAULT NULL,
  `Comment` longtext,
  `booStatus` tinyint(4) DEFAULT NULL,
  `intAISHAvailableItemsID` int(11) DEFAULT NULL,
  PRIMARY KEY (`intAIStatusID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_ai_status_history`
--

LOCK TABLES `tbl_ai_status_history` WRITE;
/*!40000 ALTER TABLE `tbl_ai_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_ai_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_ar_detail`
--

DROP TABLE IF EXISTS `tbl_ar_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_ar_detail` (
  `intARDetailID` int(11) NOT NULL AUTO_INCREMENT,
  `strARItemID` varchar(45) NOT NULL,
  `intARReceiptID` varchar(45) DEFAULT NULL,
  `dblCommission` double DEFAULT NULL,
  `dblHammerPrice` double DEFAULT NULL,
  `intARDAuctionResultID` int(11) NOT NULL,
  `booType` tinyint(4) NOT NULL,
  `intARQTY` int(11) DEFAULT NULL,
  `strARJson` longtext NOT NULL,
  PRIMARY KEY (`intARDetailID`),
  KEY `fkkk_idx` (`intARDAuctionResultID`),
  CONSTRAINT `fkkk` FOREIGN KEY (`intARDAuctionResultID`) REFERENCES `tbl_auctionresult` (`intAuctionResultID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_ar_detail`
--

LOCK TABLES `tbl_ar_detail` WRITE;
/*!40000 ALTER TABLE `tbl_ar_detail` DISABLE KEYS */;
INSERT INTO `tbl_ar_detail` VALUES (24,'I-000003','101920189203297059',375,2500,72,1,1,'{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Samsung\", \"Model\": \"SMW12002\", \"Wattage\": \"0-199\"}'),(25,'B-000001',NULL,NULL,NULL,72,3,NULL,'PUP Bundle');
/*!40000 ALTER TABLE `tbl_ar_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_auction`
--

DROP TABLE IF EXISTS `tbl_auction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_auction` (
  `intAuctionID` int(6) NOT NULL AUTO_INCREMENT,
  `datDateStart` datetime DEFAULT NULL,
  `jsonDuration` json NOT NULL,
  `booAuctionType` tinyint(4) NOT NULL,
  `strDescription` longtext NOT NULL,
  `booAuctionStatus` tinyint(1) NOT NULL DEFAULT '0',
  `strAuctionName` varchar(20) NOT NULL,
  `datDateCreated` datetime NOT NULL,
  `strBanner` longtext NOT NULL,
  `datDateEnd` datetime DEFAULT NULL,
  PRIMARY KEY (`intAuctionID`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_auction`
--

LOCK TABLES `tbl_auction` WRITE;
/*!40000 ALTER TABLE `tbl_auction` DISABLE KEYS */;
INSERT INTO `tbl_auction` VALUES (11,'2018-10-18 00:00:00','{\"days\": \"1\", \"hours\": \"0\", \"minutes\": \"6\", \"startingTime\": \"00:00\"}',2,'This is an auction example.',4,'Capstone Auction','2018-10-17 18:09:00','auctionBanner-1539770983996.jpg',NULL),(12,'2018-10-18 00:00:00','{\"days\": \"1\", \"hours\": \"0\", \"minutes\": \"0\", \"startingTime\": \"00:00\"}',2,'',4,'Pokemon','2018-10-17 18:10:00','auctionBanner-1539771038874.jpg',NULL),(13,'2018-10-18 00:00:00','{\"days\": \"1\", \"hours\": \"0\", \"minutes\": \"0\", \"startingTime\": \"00:00\"}',2,'This is an example auction',3,'PUP Auction','2018-10-17 18:46:00','auctionBanner-1539773162319.jpg','2018-10-19 00:00:05');
/*!40000 ALTER TABLE `tbl_auction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_auction_status_history`
--

DROP TABLE IF EXISTS `tbl_auction_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_auction_status_history` (
  `intAuctionStatusID` int(11) NOT NULL AUTO_INCREMENT,
  `datDateChange` date DEFAULT NULL,
  `intStaffID` int(11) DEFAULT NULL,
  `strComment` longtext,
  `booStatus` tinyint(4) DEFAULT NULL,
  `intASHAuctionID` int(6) DEFAULT NULL,
  PRIMARY KEY (`intAuctionStatusID`),
  KEY `ASH to auction` (`intASHAuctionID`),
  CONSTRAINT `ASH to auction` FOREIGN KEY (`intASHAuctionID`) REFERENCES `tbl_auction` (`intAuctionID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_auction_status_history`
--

LOCK TABLES `tbl_auction_status_history` WRITE;
/*!40000 ALTER TABLE `tbl_auction_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_auction_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_auctionresult`
--

DROP TABLE IF EXISTS `tbl_auctionresult`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_auctionresult` (
  `intAuctionResultID` int(11) NOT NULL AUTO_INCREMENT,
  `intARConsignorID` varchar(30) NOT NULL,
  `intARAuctionID` int(11) NOT NULL,
  `strARCode` varchar(10) NOT NULL,
  `booARStatus` tinyint(4) NOT NULL,
  `strSignatureCon` longtext,
  `strSignatureAdm` longtext,
  `datDateClaimed` datetime DEFAULT NULL,
  PRIMARY KEY (`intAuctionResultID`),
  UNIQUE KEY `As` (`intARConsignorID`,`intARAuctionID`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_auctionresult`
--

LOCK TABLES `tbl_auctionresult` WRITE;
/*!40000 ALTER TABLE `tbl_auctionresult` DISABLE KEYS */;
INSERT INTO `tbl_auctionresult` VALUES (71,'2018-CON-CP-000002',9,'vJtWxVmb',1,'data:image/jpeg;base64,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','data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCADIAZADASIAAhEBAxEB/8QAHQABAAICAwEBAAAAAAAAAAAAAAcIBQYDBAkCAf/EAD0QAAEDBAICAQIEBAMDDQAAAAEAAgMEBQYRBwgSIRMJMRQiQWEVMkJRFhcjM5GhGCQlQ0VTWWJxdIGn0//EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD1TREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBFFXZDsjxv1f45quQuRLgQPcNttsDh+KudTrbYYWn/e5x/K0ez+gPnhkX1Re61HSR8zR9aKCz8VMrm0vlXW6uc2UOeR4/jyWNLttLBI2IMD9AtJ00h6yIo74D534+7HcZWvlLji6NqrfXN+KqpnECot1Y1rTLSVDP6JWeQ/ZzXMe0uY9rjIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgKPecOduOuveET51yNdXQUzSYqOip/F9ZcajRLaemjc5vySu16GwP7kLoc+9gsR4BxumuV5paq8X28TCksGO2/Tq68VRc1oihb+xe0ud9mjZP2UXcOdWckyHkKLsp2tuNFlHIxaDY7LT+brNidO4bENLE8fnnG/wA0rt/mGxsjzIaDw91azLsTylB2x7h22b8VC5rsLwCqiLaayUf80Zq4Xt2Z/I+RY7+sbf5a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HTxA616YwAfoP0WSQaZLbOVL5CY63JbRjLJqYMe200xrqmCV38zoqipDYj4jQaX0xBP5nN1+RdCTgrAbq4S5tFc8zeGhhbkdfJW0xH/tHEUwJP3IiBPrZIA1ISIOpa7Va7HQQ2qy22lt9FTt8YaalhbFFGN701jQABsn7BdtEQEREBVt53+np1Y7ASVdzyTj6PH8grJHTS37GXNt9ZJK+X5ZZJGhroJ5HnyDpJopH6c7RB0RZJEHnDR/Tf7X8DzCTqV3JrKC3MrZZ4LDkDJoKGCNzgQXsZ+Ip6iX0A5xpmA6+w3pbB/m79WjiV3hmvXzCOTrLbNuqrjYqlkdbXN0f9kyOcPBH7Uez/ZX+RBRu1/U1v1jtk1fzT0l5xw0xAvLqWyvrIRHvQc6SpZS+Pvf6a/crqZH3+7B8oU1PZOp3S7kSurbwwtosgzK3GgttO9unuLvF3wOBjDw0vqogHFnp+/A3vRBXvpv1erOuOJ5Ddc2yKDJeSOQbo+/Zje4GeEVRVuc94iiGm7jY+WZwcWtLnSvPi0FrG2EREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERBj7/W3a3WeprbHZDd66No+GiFQyD5iXAa+R/wCVoAJJJ/t6BPpRZLZ+0+amN1wy/C+MqB43JT2Wjkv9z0Sf5auqENNE4DWwaSZu9+yNEzGiCFYuo/E12rYbtyo/IOU7jC572y5vdX3GkBfrZbbh4W+P7DRjpmkKXbPZbPj1tgs2P2mjtlvpW+EFJRwMhhib/ZrGANaP2AXdRAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERB//2Q==','2018-10-29 00:04:17'),(72,'2018-CON-CP-000004',13,'suHdFlEO',1,'data:image/jpeg;base64,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','data:image/jpeg;base64,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','2018-10-23 00:02:41');
/*!40000 ALTER TABLE `tbl_auctionresult` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_award_issues`
--

DROP TABLE IF EXISTS `tbl_award_issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_award_issues` (
  `intAwardIssuesID` int(12) NOT NULL,
  `intAIBidlistID` int(11) NOT NULL,
  `intQTY` int(4) NOT NULL,
  `strIssue` varchar(20) NOT NULL,
  `datDateSeen` date NOT NULL,
  PRIMARY KEY (`intAwardIssuesID`),
  KEY `award issues to bidlist_idx` (`intAIBidlistID`),
  CONSTRAINT `award issues to bidlist` FOREIGN KEY (`intAIBidlistID`) REFERENCES `tbl_bidlist` (`intBidlistID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_award_issues`
--

LOCK TABLES `tbl_award_issues` WRITE;
/*!40000 ALTER TABLE `tbl_award_issues` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_award_issues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_ba_status_history`
--

DROP TABLE IF EXISTS `tbl_ba_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_ba_status_history` (
  `intBAStatusID` int(6) NOT NULL,
  `datDateChange` date NOT NULL,
  `intStaffID` int(11) NOT NULL,
  `Comment` longtext,
  `booStatus` tinyint(4) NOT NULL,
  `intBASHBidderAccountsID` int(5) NOT NULL,
  PRIMARY KEY (`intBAStatusID`),
  KEY `bash to ba_idx` (`intBASHBidderAccountsID`),
  CONSTRAINT `bash to ba` FOREIGN KEY (`intBASHBidderAccountsID`) REFERENCES `tbl_bidder_accounts` (`intBidderAccounts`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_ba_status_history`
--

LOCK TABLES `tbl_ba_status_history` WRITE;
/*!40000 ALTER TABLE `tbl_ba_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_ba_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_bidder`
--

DROP TABLE IF EXISTS `tbl_bidder`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_bidder` (
  `intBidderID` int(7) NOT NULL AUTO_INCREMENT,
  `strName` varchar(70) NOT NULL,
  `strAddress` longtext NOT NULL,
  `strContact` varchar(20) NOT NULL,
  `strEmailAddress` varchar(50) NOT NULL,
  `strIDType` varchar(100) NOT NULL,
  `strIDNumber` varchar(20) NOT NULL,
  `intBidderConsignorID` varchar(20) DEFAULT NULL,
  `strBankReferenceNo` varchar(20) DEFAULT NULL,
  `strReferencePicture` longtext,
  `strIDPicture` longtext NOT NULL,
  `booOnline` tinyint(4) NOT NULL DEFAULT '0',
  `datDateRegistered` date NOT NULL,
  PRIMARY KEY (`intBidderID`),
  UNIQUE KEY `strEmaiAddress_UNIQUE` (`strEmailAddress`),
  UNIQUE KEY `index4` (`strIDType`,`strIDNumber`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_bidder`
--

LOCK TABLES `tbl_bidder` WRITE;
/*!40000 ALTER TABLE `tbl_bidder` DISABLE KEYS */;
INSERT INTO `tbl_bidder` VALUES (73,'Juan  Dela Cruz','Lot 21 Block 13, 13th Avenue, Suburbia East Subd., Parang, Marikina City','999-9999','juand@c.com','New ID','ID-7678',NULL,'98908098','bg-1.jpg','IDPicture-1539877909327.jpg',1,'2018-10-18'),(74,'Mika  Dela','Noooooo','999-9999','woah@gg.com','Polytechnic University of the Philippines ID','8789-7987',NULL,NULL,NULL,'IDPicture-1539878006398.jpg',0,'2018-10-18'),(75,'M m m','m','999-9999','m@M','Polytechnic University of the Philippines ID','9987-0',NULL,NULL,NULL,'IDPicture-1539879145885.jpg',0,'2018-10-19'),(76,'Fritz  Santuico','Valenzuela','999-9999','fsantuico@gmail.com','Polytechnic University of the Philippines ID','1111-11111-OO-1',NULL,'3qweqwe','bg-1.jpg','IDPicture-1540229853870.jpg',1,'2018-10-23'),(77,'Froilan Sam  Malibiran','Lot 21 Block 13, 13th Avenue, Suburbia East Subd., Parang','999-9999','malibiran@gmail.com','Polytechnic University of the Philippines ID','8374-89237-MN-8',NULL,'APP-REF-5376021167',NULL,'IDPicture-1539773393289.jpg',1,'2018-10-17');
/*!40000 ALTER TABLE `tbl_bidder` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_bidder_accounts`
--

DROP TABLE IF EXISTS `tbl_bidder_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_bidder_accounts` (
  `intBidderAccounts` int(5) NOT NULL AUTO_INCREMENT,
  `strUsername` varchar(15) NOT NULL,
  `strPassword` varchar(100) NOT NULL,
  `intBABidderID` int(7) NOT NULL,
  `booStatus` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intBidderAccounts`),
  UNIQUE KEY `intUsername_UNIQUE` (`strUsername`),
  UNIQUE KEY `intBABidderID_UNIQUE` (`intBABidderID`),
  KEY `BA to bidder_idx` (`intBABidderID`),
  CONSTRAINT `BA to bidder` FOREIGN KEY (`intBABidderID`) REFERENCES `tbl_bidder` (`intBidderID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_bidder_accounts`
--

LOCK TABLES `tbl_bidder_accounts` WRITE;
/*!40000 ALTER TABLE `tbl_bidder_accounts` DISABLE KEYS */;
INSERT INTO `tbl_bidder_accounts` VALUES (50,'juandela','froilansam',73,1),(51,'woahdela','froilansam',74,0),(52,'lolololo','froilansam',75,0),(53,'fsantuico','froilansam',76,1),(54,'malibiran','froilansam',77,1);
/*!40000 ALTER TABLE `tbl_bidder_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_bidlist`
--

DROP TABLE IF EXISTS `tbl_bidlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_bidlist` (
  `intBidlistID` int(11) NOT NULL AUTO_INCREMENT,
  `intBidlistCatalogID` int(10) NOT NULL,
  `intBidlistBidderID` int(7) NOT NULL,
  `booStatus` tinyint(1) NOT NULL DEFAULT '0',
  `dblBidPrice` double NOT NULL,
  `intQty` int(4) DEFAULT NULL,
  `datDateBid` datetime NOT NULL,
  PRIMARY KEY (`intBidlistID`),
  KEY `bidlist to catalog_idx` (`intBidlistCatalogID`),
  CONSTRAINT `bidlist to catalog` FOREIGN KEY (`intBidlistCatalogID`) REFERENCES `tbl_catalog` (`intCatalogID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_bidlist`
--

LOCK TABLES `tbl_bidlist` WRITE;
/*!40000 ALTER TABLE `tbl_bidlist` DISABLE KEYS */;
INSERT INTO `tbl_bidlist` VALUES (73,24,0,1,100,NULL,'2018-10-18 23:58:05'),(74,25,0,0,1100,NULL,'2018-10-18 23:58:05'),(75,25,77,0,2000,NULL,'2018-10-18 23:58:58'),(76,25,77,1,2500,NULL,'2018-10-18 23:59:38');
/*!40000 ALTER TABLE `tbl_bidlist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_bidlist_status_history`
--

DROP TABLE IF EXISTS `tbl_bidlist_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_bidlist_status_history` (
  `intBidlistStatusID` int(12) NOT NULL,
  `datDateChange` date DEFAULT NULL,
  `intStaffID` int(11) DEFAULT NULL,
  `Comment` longtext,
  `booStatus` tinyint(4) DEFAULT NULL,
  `intBSHBidlstID` int(11) DEFAULT NULL,
  PRIMARY KEY (`intBidlistStatusID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_bidlist_status_history`
--

LOCK TABLES `tbl_bidlist_status_history` WRITE;
/*!40000 ALTER TABLE `tbl_bidlist_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_bidlist_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_bundle`
--

DROP TABLE IF EXISTS `tbl_bundle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_bundle` (
  `intBundleUnique` int(11) NOT NULL AUTO_INCREMENT,
  `intBundleID` varchar(20) NOT NULL,
  `dblBundlePrice` double NOT NULL,
  `strBundleTitle` varchar(80) NOT NULL,
  `booBundleStatus` tinyint(1) NOT NULL DEFAULT '0',
  `intBundleConsignmentID` int(11) NOT NULL,
  `strBundlePicture` longtext NOT NULL,
  PRIMARY KEY (`intBundleID`),
  UNIQUE KEY `intBundleUnique_UNIQUE` (`intBundleUnique`),
  KEY `bundleID to consignment_idx` (`intBundleConsignmentID`),
  CONSTRAINT `bundleID to consignment` FOREIGN KEY (`intBundleConsignmentID`) REFERENCES `tbl_consignment` (`intConsignmentID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_bundle`
--

LOCK TABLES `tbl_bundle` WRITE;
/*!40000 ALTER TABLE `tbl_bundle` DISABLE KEYS */;
INSERT INTO `tbl_bundle` VALUES (5,'B-000001',100,'PUP Bundle',0,85,'bundlePicture-1539773128124.jpg');
/*!40000 ALTER TABLE `tbl_bundle` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `apptradev7`.`tbl_bundle_BEFORE_INSERT` BEFORE INSERT ON `tbl_bundle` FOR EACH ROW
BEGIN
	Declare strconcat varchar(10);
	Declare lpadcount varchar(6);
	Declare intcount int;
	Declare strfinal varchar(16);
    DECLARE var1 int;
    DECLARE var2 int;
	SET intcount := (SELECT smartcounter_bundle() + 1);
    Set lpadcount := (SELECT Lpad(intcount, 6 , '0'));
    Set strfinal := (SELECT concat("B-", lpadcount));
    SET var1 := (SELECT RIGHT((SELECT intBundleID FROM tbl_bundle ORDER BY intBundleID DESC LIMIT 1), 6));
    SET var2 := (SELECT RIGHT(strfinal, 6));
	IF var2 = var1
    THEN
		SET var2 := var2 + 1;
		Set lpadcount := (SELECT Lpad(var2, 6 , '0'));
        Set strfinal := (SELECT concat("B-", lpadcount));
    END IF;
		
		
    SET NEW.intBundleID = strfinal;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tbl_ca_status_history`
--

DROP TABLE IF EXISTS `tbl_ca_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_ca_status_history` (
  `intCAStatusID` int(11) NOT NULL AUTO_INCREMENT,
  `datDateChange` date NOT NULL,
  `intStaffID` int(11) NOT NULL,
  `Comment` longtext,
  `booStatus` tinyint(4) NOT NULL,
  `intCASHConsignorAccountsID` int(11) NOT NULL,
  PRIMARY KEY (`intCAStatusID`),
  KEY `CASH to CA_idx` (`intCASHConsignorAccountsID`),
  CONSTRAINT `CASH to CA` FOREIGN KEY (`intCASHConsignorAccountsID`) REFERENCES `tbl_consignor_accounts` (`intConsignorAccountsID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_ca_status_history`
--

LOCK TABLES `tbl_ca_status_history` WRITE;
/*!40000 ALTER TABLE `tbl_ca_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_ca_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_catalog`
--

DROP TABLE IF EXISTS `tbl_catalog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_catalog` (
  `intCatalogID` int(10) NOT NULL AUTO_INCREMENT,
  `intCatalogAuctionID` int(6) NOT NULL,
  `intLotNumber` int(3) DEFAULT NULL,
  `strCatalogItemID` varchar(45) NOT NULL,
  PRIMARY KEY (`intCatalogID`),
  KEY `catalog to auction_idx` (`intCatalogAuctionID`),
  CONSTRAINT `catalog to auction` FOREIGN KEY (`intCatalogAuctionID`) REFERENCES `tbl_auction` (`intAuctionID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_catalog`
--

LOCK TABLES `tbl_catalog` WRITE;
/*!40000 ALTER TABLE `tbl_catalog` DISABLE KEYS */;
INSERT INTO `tbl_catalog` VALUES (24,13,NULL,'B-000001'),(25,13,NULL,'I-000003');
/*!40000 ALTER TABLE `tbl_catalog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_category`
--

DROP TABLE IF EXISTS `tbl_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_category` (
  `intCategoryID` int(3) NOT NULL AUTO_INCREMENT,
  `strCategoryName` varchar(30) NOT NULL,
  `intLife` int(11) NOT NULL,
  PRIMARY KEY (`intCategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_category`
--

LOCK TABLES `tbl_category` WRITE;
/*!40000 ALTER TABLE `tbl_category` DISABLE KEYS */;
INSERT INTO `tbl_category` VALUES (1,'Appliances',10),(2,'Bags',13),(3,'Camera',5),(4,'Computer Machine',5),(5,'Furniture',20),(6,'Generic Gadget',5),(7,'Mobile',4),(8,'Shoes',5),(9,'Toys',4),(10,'Television',3);
/*!40000 ALTER TABLE `tbl_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_ci_status_history`
--

DROP TABLE IF EXISTS `tbl_ci_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_ci_status_history` (
  `intCIStatusID` int(9) NOT NULL AUTO_INCREMENT,
  `datDateChange` date NOT NULL,
  `intStaffID` int(11) NOT NULL,
  `Comment` longtext,
  `booStatus` tinyint(4) NOT NULL,
  `intConsignmentItemID` int(8) NOT NULL,
  PRIMARY KEY (`intCIStatusID`),
  KEY `CISH to CI` (`intConsignmentItemID`),
  CONSTRAINT `CISH to CI` FOREIGN KEY (`intConsignmentItemID`) REFERENCES `tbl_consignment_item` (`intConsignmentItemID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_ci_status_history`
--

LOCK TABLES `tbl_ci_status_history` WRITE;
/*!40000 ALTER TABLE `tbl_ci_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_ci_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_color`
--

DROP TABLE IF EXISTS `tbl_color`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_color` (
  `intColorID` int(9) NOT NULL AUTO_INCREMENT,
  `intColorConsignmentItemID` int(8) DEFAULT NULL,
  `strColor` varchar(15) DEFAULT NULL,
  `intQTY` int(4) DEFAULT NULL,
  PRIMARY KEY (`intColorID`),
  KEY `color to consingment item` (`intColorConsignmentItemID`),
  CONSTRAINT `color to consingment item` FOREIGN KEY (`intColorConsignmentItemID`) REFERENCES `tbl_consignment_item` (`intConsignmentItemID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_color`
--

LOCK TABLES `tbl_color` WRITE;
/*!40000 ALTER TABLE `tbl_color` DISABLE KEYS */;
INSERT INTO `tbl_color` VALUES (29,44,'assorted',1),(30,45,'assorted',1),(31,50,'#8a3c3c',1),(32,51,'assorted',2),(33,53,'assorted',1);
/*!40000 ALTER TABLE `tbl_color` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_consignment`
--

DROP TABLE IF EXISTS `tbl_consignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_consignment` (
  `intConsignmentID` int(8) NOT NULL AUTO_INCREMENT,
  `intConsignmentConsignorID` varchar(20) NOT NULL,
  `datDateReceived` date DEFAULT NULL,
  `booStatus` tinyint(1) NOT NULL DEFAULT '0',
  `strConsignmentCode` varchar(8) DEFAULT NULL,
  `datDateCreated` date DEFAULT NULL,
  `strSignatureAdmin` longtext,
  `strSignatureConsignor` longtext,
  PRIMARY KEY (`intConsignmentID`),
  KEY `consignment to consignor _idx` (`intConsignmentConsignorID`),
  CONSTRAINT `consignment to consignor` FOREIGN KEY (`intConsignmentConsignorID`) REFERENCES `tbl_consignor` (`intConsignorID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_consignment`
--

LOCK TABLES `tbl_consignment` WRITE;
/*!40000 ALTER TABLE `tbl_consignment` DISABLE KEYS */;
INSERT INTO `tbl_consignment` VALUES (84,'2018-CON-PS-000003','2018-10-17',1,'MXnCbqRJ','2018-10-17','data:image/jpeg;base64,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','data:image/jpeg;base64,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'),(85,'2018-CON-CP-000004','2018-10-17',1,'VaBG3X08','2018-10-17','data:image/jpeg;base64,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','data:image/jpeg;base64,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');
/*!40000 ALTER TABLE `tbl_consignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_consignment_item`
--

DROP TABLE IF EXISTS `tbl_consignment_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_consignment_item` (
  `intConsignmentItemID` int(8) NOT NULL AUTO_INCREMENT,
  `intCIConsignment` int(8) NOT NULL,
  `strItemDescription` varchar(50) CHARACTER SET utf8 NOT NULL,
  `strCategory` varchar(50) COLLATE utf8_bin NOT NULL,
  `booItemStatus` tinyint(1) NOT NULL DEFAULT '0',
  `strUOM` varchar(12) COLLATE utf8_bin NOT NULL,
  `jsonOtherSpecifications` json NOT NULL,
  `intQTY` int(4) NOT NULL,
  `booIsReceived` tinyint(1) NOT NULL DEFAULT '0',
  `booIsBundled` tinyint(1) NOT NULL DEFAULT '0',
  `booPrice` tinyint(4) NOT NULL DEFAULT '0',
  `booCondition` int(11) DEFAULT NULL,
  `strItemID` varchar(45) COLLATE utf8_bin DEFAULT NULL,
  `intTimesInAuction` int(11) NOT NULL DEFAULT '0',
  `intStorage` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intConsignmentItemID`),
  UNIQUE KEY `strItemID_UNIQUE` (`strItemID`),
  KEY `CID to consignment_idx` (`intCIConsignment`),
  CONSTRAINT `CID to consignment` FOREIGN KEY (`intCIConsignment`) REFERENCES `tbl_consignment` (`intConsignmentID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_consignment_item`
--

LOCK TABLES `tbl_consignment_item` WRITE;
/*!40000 ALTER TABLE `tbl_consignment_item` DISABLE KEYS */;
INSERT INTO `tbl_consignment_item` VALUES (44,84,'','Generic Gadget',0,'Box','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Razer\", \"Model\": \"BlackWidow X Chroma Gunmetal\"}',1,1,0,0,4,'I-000001',0,2),(45,84,'','Generic Gadget',0,'Box','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Razer\", \"Model\": \"DeathAdder Elite\"}',1,1,0,0,4,'I-000002',0,2),(50,85,'','Appliances',2,'Unit','{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Samsung\", \"Model\": \"SMW12002\", \"Wattage\": \"0-199\"}',0,1,0,1,5,'I-000003',1,2),(51,85,'','Generic Gadget',1,'Pack','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Logitech\", \"Model\": \"MC900\"}',2,1,1,0,4,'I-000004',1,1),(53,85,'','Generic Gadget',1,'Unit','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Razer\", \"Model\": \"DeathAdder Elite\"}',1,1,1,0,4,'I-000005',1,2);
/*!40000 ALTER TABLE `tbl_consignment_item` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `apptradev7`.`tbl_consignment_item_BEFORE_INSERT` BEFORE INSERT ON `tbl_consignment_item` FOR EACH ROW
BEGIN
	Declare strconcat varchar(10);
	Declare lpadcount varchar(6);
	Declare intcount int;
	Declare strfinal varchar(16);
    DECLARE var1 int;
    DECLARE var2 int;
	SET intcount := (SELECT smartcounter_item() + 1);
    Set lpadcount := (SELECT Lpad(intcount, 6 , '0'));
    Set strfinal := (SELECT concat("I-", lpadcount));
    SET var1 := (SELECT RIGHT((SELECT strItemID FROM tbl_consignment_item ORDER BY strItemID DESC LIMIT 1), 6));
    SET var2 := (SELECT RIGHT(strfinal, 6));
	IF var2 <= var1
    THEN
		SET var2 := var1 + 1;
		Set lpadcount := (SELECT Lpad(var2, 6 , '0'));
        Set strfinal := (SELECT concat("I-", lpadcount));
    END IF;
		
		
    SET NEW.strItemID = strfinal;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tbl_consignment_item_pictures`
--

DROP TABLE IF EXISTS `tbl_consignment_item_pictures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_consignment_item_pictures` (
  `intConsignmentItemPicturesID` int(10) NOT NULL AUTO_INCREMENT,
  `intCIPConsignmentItemID` int(9) NOT NULL,
  `strPicture` longtext NOT NULL,
  PRIMARY KEY (`intConsignmentItemPicturesID`),
  KEY `CIDR to consignment item_idx` (`intCIPConsignmentItemID`),
  CONSTRAINT `CIP to consingment item` FOREIGN KEY (`intCIPConsignmentItemID`) REFERENCES `tbl_consignment_item` (`intConsignmentItemID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_consignment_item_pictures`
--

LOCK TABLES `tbl_consignment_item_pictures` WRITE;
/*!40000 ALTER TABLE `tbl_consignment_item_pictures` DISABLE KEYS */;
INSERT INTO `tbl_consignment_item_pictures` VALUES (29,44,'strPicture-1539770911036.jpg'),(30,45,'strPicture-1539770923157.jpg'),(31,50,'strPicture-1539773014129.jpg'),(32,51,'strPicture-1539773030940.jpg'),(33,53,'strPicture-1539773023905.jpg');
/*!40000 ALTER TABLE `tbl_consignment_item_pictures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_consignment_status_history`
--

DROP TABLE IF EXISTS `tbl_consignment_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_consignment_status_history` (
  `intConsignmentStatusID` int(11) NOT NULL,
  `datDateChange` date NOT NULL,
  `intStaffID` int(11) NOT NULL,
  `Comment` longtext,
  `booStatus` tinyint(4) NOT NULL,
  `intCSHConsignmentID` int(8) NOT NULL,
  PRIMARY KEY (`intConsignmentStatusID`),
  KEY `CSH to consignment_idx` (`intCSHConsignmentID`),
  CONSTRAINT `CSH to consignment` FOREIGN KEY (`intCSHConsignmentID`) REFERENCES `tbl_consignment` (`intConsignmentID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_consignment_status_history`
--

LOCK TABLES `tbl_consignment_status_history` WRITE;
/*!40000 ALTER TABLE `tbl_consignment_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_consignment_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_consignor`
--

DROP TABLE IF EXISTS `tbl_consignor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_consignor` (
  `intConsignorID` varchar(20) NOT NULL,
  `strName` varchar(100) NOT NULL,
  `strAddress` longtext NOT NULL,
  `strPhone` varchar(40) NOT NULL,
  `strEmail` varchar(50) NOT NULL,
  `strCheckPayable` varchar(70) NOT NULL,
  `strIDType` varchar(100) NOT NULL,
  `strIDNumber` varchar(20) NOT NULL,
  `booConsignorType` tinyint(1) NOT NULL,
  `strTinNumber` varchar(12) DEFAULT NULL,
  `strIDPicture` longtext,
  `datDateRegistered` datetime NOT NULL,
  `strTelephone` varchar(45) NOT NULL,
  `strRepresentativeFirstName` varchar(100) NOT NULL,
  `strRepresentativeLastName` varchar(100) NOT NULL,
  `booOnline` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intConsignorID`),
  UNIQUE KEY `strEmail_UNIQUE` (`strEmail`),
  UNIQUE KEY `strIDNumber_UNIQUE` (`strIDNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_consignor`
--

LOCK TABLES `tbl_consignor` WRITE;
/*!40000 ALTER TABLE `tbl_consignor` DISABLE KEYS */;
INSERT INTO `tbl_consignor` VALUES ('2018-CON-CP-000001','Amacor','Brgy. Malamig, Boni, Mandaluyong City','(+63) 988 989-8988','shinaydalla@gmail.com','Amacor','Polytechnic University of the Philippines ID','7678-67868-aa-7',0,'67686676676','IDPicture-1540402717428.jpg','2018-10-25 01:38:37','','Sherwin','Aydalla',0),('2018-CON-CP-000002','Fritz','Valenzuela','','fsantuico@gmail.com','Fritz','Polytechnic University of the Philippines ID','1111-11111-MN-0',0,'123123123','IDPicture-1540228579683.jpg','2018-10-23 01:16:19','','Fritz','Santuico',1),('2018-CON-CP-000004','PUP','Sta. Mesa, Manila','(+63) 999 938-8383','reych1221@yahoo.com','Juana Dela Cruz','Polytechnic University of the Philippines ID','2018-73873-MN-8',0,'8776788','IDPicture-1539772573910.jpg','2018-10-17 18:36:13','','Juana','Dela Cruz',1),('2018-CON-PS-000003','Jerevon Carreon','Mandaluyong','','volajuzas@oranek.com','Jerevon','Polytechnic University of the Philippines ID','9274-83274-MN-8',1,NULL,'IDPicture-1540754848514.jpg','2018-10-29 03:27:28','','Jerevon','Carreon',1);
/*!40000 ALTER TABLE `tbl_consignor` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `apptradev7`.`tbl_consignor_BEFORE_INSERT` BEFORE INSERT ON `tbl_consignor` FOR EACH ROW
BEGIN
	Declare strconcat varchar(10);
	Declare lpadcount varchar(6);
	Declare intcount int;
	Declare strfinal varchar(20);
    DECLARE var1 int;
    DECLARE var2 int;
    DECLARE var3 int;
    SET var1 := (SELECT RIGHT((SELECT intConsignorID FROM tbl_consignor ORDER BY intConsignorID DESC LIMIT 1), 6));
    
    SET var3 := NEW.booConsignorType;
    SET intcount := (SELECT smartcounter() + 1);
    Set lpadcount := (SELECT Lpad(intcount, 6 , '0'));
    SET var2 := (SELECT RIGHT(lpadcount, 6));
    
    
   
    
	IF var2 <= var1
    THEN
		SET var2 := var1 + 1;
		SET lpadcount := (SELECT Lpad(var2, 6 , '0'));
    END IF;
    
    IF var3 = '0'
	THEN
		 Set strfinal := (SELECT concat(LEFT(NOW(), 4),"-CON-CP-", lpadcount));
	ELSEIF var3 = '1'
	THEN
		SET strfinal := (SELECT concat(LEFT(NOW(), 4),"-CON-PS-", lpadcount));
	END IF;
    
		
		
    SET NEW.intConsignorID = strfinal;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tbl_consignor_account_logs`
--

DROP TABLE IF EXISTS `tbl_consignor_account_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_consignor_account_logs` (
  `intCALogID` int(11) NOT NULL AUTO_INCREMENT,
  `intCALogCAID` int(11) NOT NULL,
  `datDateLogin` datetime NOT NULL,
  `strLocalIP` varchar(15) NOT NULL,
  `strPublicIP` varchar(15) NOT NULL,
  PRIMARY KEY (`intCALogID`),
  KEY `consignor logs to consignor accounts_idx` (`intCALogCAID`),
  CONSTRAINT `consignor logs to consignor accounts` FOREIGN KEY (`intCALogCAID`) REFERENCES `tbl_consignor_accounts` (`intConsignorAccountsID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_consignor_account_logs`
--

LOCK TABLES `tbl_consignor_account_logs` WRITE;
/*!40000 ALTER TABLE `tbl_consignor_account_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_consignor_account_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_consignor_accounts`
--

DROP TABLE IF EXISTS `tbl_consignor_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_consignor_accounts` (
  `intConsignorAccountsID` int(7) NOT NULL AUTO_INCREMENT,
  `strUsername` varchar(15) NOT NULL,
  `strPassword` varchar(100) DEFAULT NULL,
  `intCSConsignorID` varchar(20) NOT NULL,
  `booStatus` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intConsignorAccountsID`),
  UNIQUE KEY `strUsername_UNIQUE` (`strUsername`),
  KEY `consignor accounts to consignor_idx` (`intCSConsignorID`),
  CONSTRAINT `ca to c` FOREIGN KEY (`intCSConsignorID`) REFERENCES `tbl_consignor` (`intConsignorID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_consignor_accounts`
--

LOCK TABLES `tbl_consignor_accounts` WRITE;
/*!40000 ALTER TABLE `tbl_consignor_accounts` DISABLE KEYS */;
INSERT INTO `tbl_consignor_accounts` VALUES (57,'sherwin','froilansam','2018-CON-CP-000001',0),(85,'fsantuico','froilansam','2018-CON-CP-000002',0),(86,'jerevon','froilansam','2018-CON-PS-000003',0),(87,'juanadc','froilansam','2018-CON-CP-000004',0);
/*!40000 ALTER TABLE `tbl_consignor_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_consignor_storage`
--

DROP TABLE IF EXISTS `tbl_consignor_storage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_consignor_storage` (
  `intConsignorStorageID` int(7) NOT NULL AUTO_INCREMENT,
  `intCSConsignorID` varchar(20) NOT NULL,
  `datDateofStorage` date NOT NULL,
  `booStatus` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intConsignorStorageID`),
  KEY `cs to c _idx` (`intCSConsignorID`),
  CONSTRAINT `cs to c ` FOREIGN KEY (`intCSConsignorID`) REFERENCES `tbl_consignor` (`intConsignorID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_consignor_storage`
--

LOCK TABLES `tbl_consignor_storage` WRITE;
/*!40000 ALTER TABLE `tbl_consignor_storage` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_consignor_storage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_consignor_storage_details`
--

DROP TABLE IF EXISTS `tbl_consignor_storage_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_consignor_storage_details` (
  `intConsignorStorageDetailsID` int(8) NOT NULL AUTO_INCREMENT,
  `intCSDConsignorStorageID` int(7) NOT NULL,
  `intCSDConsignor_ItemsID` int(8) NOT NULL,
  PRIMARY KEY (`intConsignorStorageDetailsID`),
  KEY `consignor storage details to consignor storage_idx` (`intCSDConsignorStorageID`),
  KEY `consignor storage details to consignor items_idx` (`intCSDConsignor_ItemsID`),
  CONSTRAINT `consignor storage details to consignor items` FOREIGN KEY (`intCSDConsignor_ItemsID`) REFERENCES `tbl_consignment_item` (`intConsignmentItemID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `consignor storage details to consignor storage` FOREIGN KEY (`intCSDConsignorStorageID`) REFERENCES `tbl_consignor_storage` (`intConsignorStorageID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_consignor_storage_details`
--

LOCK TABLES `tbl_consignor_storage_details` WRITE;
/*!40000 ALTER TABLE `tbl_consignor_storage_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_consignor_storage_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_cs_status_history`
--

DROP TABLE IF EXISTS `tbl_cs_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_cs_status_history` (
  `intCSStatusID` int(11) NOT NULL AUTO_INCREMENT,
  `datDateChange` date NOT NULL,
  `intStaffID` int(11) NOT NULL,
  `Comment` longtext,
  `booStatus` tinyint(4) NOT NULL,
  `intCSSHConsignorStorage` int(7) NOT NULL,
  PRIMARY KEY (`intCSStatusID`),
  KEY `CSSH to CS_idx` (`intCSSHConsignorStorage`),
  CONSTRAINT `CSSH to CS` FOREIGN KEY (`intCSSHConsignorStorage`) REFERENCES `tbl_consignor_storage` (`intConsignorStorageID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_cs_status_history`
--

LOCK TABLES `tbl_cs_status_history` WRITE;
/*!40000 ALTER TABLE `tbl_cs_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_cs_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_employee`
--

DROP TABLE IF EXISTS `tbl_employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_employee` (
  `intEmployeeID` int(11) NOT NULL AUTO_INCREMENT,
  `strEmployeeFirstName` varchar(40) NOT NULL,
  `strEmployeeLastName` varchar(40) NOT NULL,
  `strEmployeeMiddleName` varchar(40) DEFAULT NULL,
  `intJobType` int(2) NOT NULL,
  `strEmailAddress` varchar(50) NOT NULL,
  `strContactNumber` varchar(13) DEFAULT NULL,
  `strUsername` varchar(20) NOT NULL,
  `strPassword` varchar(100) NOT NULL,
  `booStatus` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intEmployeeID`),
  UNIQUE KEY `strEmailAddress_UNIQUE` (`strEmailAddress`),
  UNIQUE KEY `strUsername_UNIQUE` (`strUsername`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_employee`
--

LOCK TABLES `tbl_employee` WRITE;
/*!40000 ALTER TABLE `tbl_employee` DISABLE KEYS */;
INSERT INTO `tbl_employee` VALUES (1,'Gramar','Lacsina','Momolandi',1,'gramar@gmail.com','09123456789','gramar','gramar',0),(2,'Froilan Sam','Malibiran','Saceda',5,'froilansam@gmail.com','+639461973336','froilansam','froilansam',0),(3,'Luigi','Yambao','',6,'lcvy@gmail.com','999-9293','lcvy','froilansam',0),(4,'Rachel','Nayre','',6,'nayre@gmail.com','999-9999','nayre','nayre',0);
/*!40000 ALTER TABLE `tbl_employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_employee_logs`
--

DROP TABLE IF EXISTS `tbl_employee_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_employee_logs` (
  `intEmployeeLogID` int(11) NOT NULL AUTO_INCREMENT,
  `intEmployeeID` int(11) NOT NULL,
  `datDateLogin` datetime NOT NULL,
  `strLocalIP` varchar(15) DEFAULT NULL,
  `strPublicIP` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`intEmployeeLogID`),
  KEY `employeeLogs to employee_idx` (`intEmployeeID`),
  CONSTRAINT `employeeLogs to employee` FOREIGN KEY (`intEmployeeID`) REFERENCES `tbl_employee` (`intEmployeeID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_employee_logs`
--

LOCK TABLES `tbl_employee_logs` WRITE;
/*!40000 ALTER TABLE `tbl_employee_logs` DISABLE KEYS */;
INSERT INTO `tbl_employee_logs` VALUES (3,1,'2018-09-28 00:30:00','192.168.0.14','130.105.99.151'),(4,1,'2018-10-02 18:27:00','192.168.0.10','130.105.99.122'),(5,1,'2018-09-23 16:10:00','192.168.0.14','130.105.99.122'),(6,1,'2018-09-26 14:58:00','192.168.0.10','130.105.99.175'),(7,1,'2018-09-26 16:18:00','192.168.0.10','130.105.99.175'),(8,1,'2018-09-29 12:23:00','192.168.0.10','130.105.99.154'),(9,1,'2018-10-31 12:59:00','192.168.0.14','130.105.99.154'),(10,1,'2018-10-31 13:27:00','192.168.0.14','130.105.99.154'),(11,1,'2018-11-07 04:48:00','192.168.0.10','130.105.99.154'),(12,1,'2018-10-03 01:59:00','192.168.0.14','130.105.99.226'),(13,1,'2018-10-03 01:59:00','192.168.0.14','130.105.99.226'),(14,1,'2018-10-03 02:44:00','192.168.0.14','130.105.99.226'),(15,1,'2018-10-03 02:49:00','192.168.0.14','130.105.99.226'),(16,1,'2018-10-08 11:56:00','192.168.0.10','130.105.99.248'),(17,1,'2018-10-08 12:00:00','192.168.0.10','130.105.99.248'),(18,1,'2018-10-05 14:54:00','192.168.0.14','130.105.99.248'),(19,1,'2018-10-05 16:27:00','192.168.0.14','130.105.99.248'),(20,1,'2018-10-05 16:45:00','192.168.0.14','130.105.99.248'),(21,1,'2018-10-05 16:46:00','192.168.0.14','130.105.99.248'),(22,1,'2018-10-05 16:58:00','192.168.0.14','130.105.99.248'),(23,1,'2018-10-06 00:11:00','192.168.0.14','130.105.99.248'),(24,1,'2018-10-06 00:30:00','192.168.0.14','130.105.99.248'),(25,1,'2018-10-12 01:11:00','192.168.0.14','130.105.99.248'),(26,1,'2018-10-12 02:13:00','192.168.0.14','130.105.99.248'),(27,1,'2018-10-12 02:15:00','192.168.0.14','130.105.99.248'),(28,1,'2018-10-12 02:34:00','192.168.0.14','130.105.99.248'),(29,1,'2018-10-12 05:17:00','192.168.0.14','130.105.99.248'),(30,1,'2018-10-12 05:39:00','192.168.0.14','130.105.99.248'),(31,1,'2018-10-12 05:45:00','192.168.0.14','130.105.99.248'),(32,1,'2018-10-12 05:48:00','192.168.0.14','130.105.99.248'),(33,1,'2018-10-12 05:51:00','192.168.0.14','130.105.99.248'),(34,1,'2018-10-12 05:52:00','192.168.0.14','130.105.99.248'),(35,1,'2018-10-12 05:55:00','192.168.0.14','130.105.99.248'),(36,1,'2018-10-12 05:56:00','192.168.0.14','130.105.99.248'),(37,1,'2018-10-12 05:57:00','192.168.0.14','130.105.99.248'),(38,1,'2018-10-12 05:58:00','192.168.0.14','130.105.99.248'),(39,1,'2018-10-12 06:52:00','192.168.0.14','130.105.99.248'),(40,1,'2018-10-12 06:53:00','192.168.0.14','130.105.99.248'),(41,1,'2018-10-12 12:28:00','192.168.0.14','130.105.99.155'),(42,1,'2018-10-12 12:39:00','192.168.0.14','130.105.99.155'),(43,1,'2018-10-16 06:21:00','192.168.0.10','130.105.99.155'),(44,1,'2018-10-16 06:21:00','192.168.0.10','130.105.99.155'),(45,1,'2018-10-16 06:42:00','192.168.0.10','130.105.99.155'),(46,1,'2018-10-17 07:03:00','192.168.0.14','130.105.99.155'),(47,1,'2018-10-11 21:28:00','192.168.0.14','130.105.99.41'),(48,1,'2018-10-11 21:28:00','192.168.0.14','130.105.99.41'),(49,1,'2018-10-11 21:28:00','192.168.0.14','130.105.99.41'),(50,1,'2018-10-11 21:57:00','192.168.0.14','130.105.99.41'),(51,1,'2018-10-11 22:11:00','192.168.0.14','130.105.99.41'),(52,1,'2018-10-11 23:10:00','192.168.0.14','130.105.99.41'),(53,1,'2018-10-11 23:14:00','192.168.0.14','130.105.99.41'),(54,1,'2018-10-12 04:18:00','192.168.0.14','130.105.99.41'),(55,1,'2018-10-12 14:34:00','192.168.0.14','130.105.99.41'),(56,1,'2018-10-12 14:42:00','192.168.0.14','130.105.99.41'),(57,1,'2018-10-12 15:34:00','192.168.0.14','130.105.99.41'),(58,1,'2018-10-12 15:37:00','192.168.0.14','130.105.99.41'),(59,1,'2018-10-12 15:40:00','192.168.0.14','130.105.99.41'),(60,1,'2018-10-12 15:41:00','192.168.0.14','130.105.99.41'),(61,1,'2018-10-12 16:02:00','192.168.0.14','130.105.99.41'),(62,1,'2018-10-12 16:08:00','192.168.0.14','130.105.99.41'),(63,1,'2018-10-12 16:10:00','192.168.0.14','130.105.99.41'),(64,1,'2018-10-12 16:13:00','192.168.0.14','130.105.99.41'),(65,1,'2018-10-12 16:26:00','192.168.0.14','130.105.99.41'),(66,1,'2018-10-12 17:23:00','192.168.0.14','130.105.99.41'),(67,1,'2018-10-12 17:51:00','192.168.0.14','130.105.99.41'),(68,1,'2018-10-12 23:08:00','192.168.0.14','130.105.99.41'),(69,1,'2018-10-13 21:51:00','192.168.0.14','130.105.99.50'),(70,1,'2018-10-22 01:03:00','192.168.0.14','130.105.99.50'),(71,1,'2018-10-22 08:22:00','192.168.0.10','130.105.99.50'),(72,1,'2018-10-16 08:42:00','192.168.0.14','130.105.99.50'),(73,1,'2018-10-15 22:57:00','192.168.0.14','130.105.99.131'),(74,1,'2018-10-21 01:24:00','192.168.0.14','130.105.99.131'),(75,1,'2018-10-21 01:52:00','192.168.0.14','130.105.99.131'),(76,1,'2018-10-27 03:14:00','192.168.0.14','130.105.99.131'),(77,1,'2018-10-27 09:11:00','192.168.0.14','130.105.99.26'),(78,1,'2018-10-27 09:54:00','192.168.0.14','130.105.99.26'),(79,1,'2018-10-27 10:18:00','192.168.0.14','130.105.99.26'),(80,1,'2018-10-27 11:46:00','192.168.0.14','130.105.99.26'),(81,1,'2018-10-27 18:20:00','192.168.0.14',NULL),(82,1,'2018-10-27 18:20:00','192.168.0.14',NULL),(83,1,'2018-10-27 18:21:00','192.168.0.14',NULL),(84,1,'2018-10-27 18:21:00','192.168.0.14',NULL),(85,1,'2018-10-27 18:22:00','192.168.0.14',NULL),(86,1,'2018-10-27 18:23:00','192.168.0.14',NULL),(87,1,'2018-10-27 18:23:00','192.168.0.14',NULL),(88,1,'2018-10-27 18:24:00','192.168.0.14',NULL);
/*!40000 ALTER TABLE `tbl_employee_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_form_preset`
--

DROP TABLE IF EXISTS `tbl_form_preset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_form_preset` (
  `intFormPresetID` int(3) NOT NULL AUTO_INCREMENT,
  `intFPCategoryID` int(3) NOT NULL,
  `strFormDescription` varchar(30) NOT NULL,
  PRIMARY KEY (`intFormPresetID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_form_preset`
--

LOCK TABLES `tbl_form_preset` WRITE;
/*!40000 ALTER TABLE `tbl_form_preset` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_form_preset` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_historical_data`
--

DROP TABLE IF EXISTS `tbl_historical_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_historical_data` (
  `intHDID` int(11) NOT NULL AUTO_INCREMENT,
  `strCategory` varchar(45) NOT NULL,
  `jsonAttributes` longtext NOT NULL,
  `intYears` int(11) NOT NULL,
  `dblAssessment` double NOT NULL,
  `booCondition` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`intHDID`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_historical_data`
--

LOCK TABLES `tbl_historical_data` WRITE;
/*!40000 ALTER TABLE `tbl_historical_data` DISABLE KEYS */;
INSERT INTO `tbl_historical_data` VALUES (10,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Samsung\", \"Model\": \"SMW12002\", \"Wattage\": \"0-199\"}',5,1000,5),(11,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Samsung\", \"Model\": \"SMW12002\", \"Wattage\": \"0-199\"}',4,1000,3),(12,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Samsung\", \"Model\": \"SMW12002\", \"Wattage\": \"0-199\"}',6,1000,2),(13,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Samsung\", \"Model\": \"SMW12002\", \"Wattage\": \"0-199\"}',3,1000,2),(14,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Samsung\", \"Model\": \"SMW12002\", \"Wattage\": \"0-199\"}',5,1000,1),(15,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Samsung\", \"Model\": \"SMW12002\", \"Wattage\": \"0-199\"}',3,1000,4),(16,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Samsung\", \"Model\": \"SMW12002\", \"Wattage\": \"0-199\"}',2,1000,5),(17,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Samsung\", \"Model\": \"SMW12002\", \"Wattage\": \"0-199\"}',4,1000,1),(18,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Samsung\", \"Model\": \"SMW12002\", \"Wattage\": \"0-199\"}',2,1000,5),(19,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Samsung\", \"Model\": \"SMW12002\", \"Wattage\": \"0-199\"}',2,1000,4),(20,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Top Load\", \"Brand\": \"Samsung\", \"Model\": \"ESM3010D\", \"Wattage\": \"200-399\"}',4,1001,2),(21,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Top Load\", \"Brand\": \"Whirlpool\", \"Model\": \"LGTP201230\", \"Wattage\": \"0-199\"}',3,1003,4),(22,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Top Load\", \"Brand\": \"Whirlpool\", \"Model\": \"LGTP201230\", \"Wattage\": \"200-399\"}',2,1004,5),(23,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Top Load\", \"Brand\": \"Whirlpool\", \"Model\": \"LGTP201230\", \"Wattage\": \"200-399\"}',3,1005,3),(24,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Top Load\", \"Brand\": \"Whirlpool\", \"Model\": \"LGTP201230\", \"Wattage\": \"0-199\"}',4,1002,2);
/*!40000 ALTER TABLE `tbl_historical_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_id_types`
--

DROP TABLE IF EXISTS `tbl_id_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_id_types` (
  `intIDTypeID` int(11) NOT NULL AUTO_INCREMENT,
  `strIDTypeDesc` varchar(45) NOT NULL,
  `strIDTypeFormat` varchar(45) NOT NULL,
  `booStatus` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intIDTypeID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_id_types`
--

LOCK TABLES `tbl_id_types` WRITE;
/*!40000 ALTER TABLE `tbl_id_types` DISABLE KEYS */;
INSERT INTO `tbl_id_types` VALUES (1,'New ID','ID-9999',0),(2,'Wrong ID','sdjghjlr',1),(3,'af','wefwe',1),(4,'Polytechnic University of the Philippines ID','9999-99999-AA-9',0);
/*!40000 ALTER TABLE `tbl_id_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_issues`
--

DROP TABLE IF EXISTS `tbl_issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_issues` (
  `intIssuesID` int(8) NOT NULL AUTO_INCREMENT,
  `strIssue` varchar(15) NOT NULL,
  `datDateSeen` date NOT NULL,
  `intQTY` int(4) NOT NULL,
  `intIssueConsignmentItemID` int(11) DEFAULT NULL,
  `booIssueStatus` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intIssuesID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_issues`
--

LOCK TABLES `tbl_issues` WRITE;
/*!40000 ALTER TABLE `tbl_issues` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_issues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_item_quantity`
--

DROP TABLE IF EXISTS `tbl_item_quantity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_item_quantity` (
  `intItemQuantityID` int(11) NOT NULL,
  `intIQConsignmentItemID` int(10) NOT NULL,
  `intQTY` int(4) NOT NULL,
  PRIMARY KEY (`intItemQuantityID`),
  KEY `RI to CI` (`intIQConsignmentItemID`),
  CONSTRAINT `RI to CI` FOREIGN KEY (`intIQConsignmentItemID`) REFERENCES `tbl_consignment_item` (`intConsignmentItemID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_item_quantity`
--

LOCK TABLES `tbl_item_quantity` WRITE;
/*!40000 ALTER TABLE `tbl_item_quantity` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_item_quantity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_items_in_bundle`
--

DROP TABLE IF EXISTS `tbl_items_in_bundle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_items_in_bundle` (
  `intItemsInBundleID` int(11) NOT NULL AUTO_INCREMENT,
  `intIIBItemID` int(11) NOT NULL,
  `strIIBBundleID` varchar(20) NOT NULL,
  PRIMARY KEY (`intItemsInBundleID`),
  KEY `IIB to Item` (`intIIBItemID`),
  KEY `IIB to Bundle_idx` (`strIIBBundleID`),
  CONSTRAINT `IIB to Bundle` FOREIGN KEY (`strIIBBundleID`) REFERENCES `tbl_bundle` (`intBundleID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `IIB to Item` FOREIGN KEY (`intIIBItemID`) REFERENCES `tbl_consignment_item` (`intConsignmentItemID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_items_in_bundle`
--

LOCK TABLES `tbl_items_in_bundle` WRITE;
/*!40000 ALTER TABLE `tbl_items_in_bundle` DISABLE KEYS */;
INSERT INTO `tbl_items_in_bundle` VALUES (9,51,'B-000001'),(10,53,'B-000001');
/*!40000 ALTER TABLE `tbl_items_in_bundle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_job_title`
--

DROP TABLE IF EXISTS `tbl_job_title`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_job_title` (
  `intJobTitleID` int(11) NOT NULL AUTO_INCREMENT,
  `strJobTitle` varchar(30) NOT NULL,
  `booInventory` tinyint(1) NOT NULL DEFAULT '0',
  `booAcquisition` tinyint(1) NOT NULL DEFAULT '0',
  `booAuction` tinyint(1) NOT NULL DEFAULT '0',
  `booStatus` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`intJobTitleID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_job_title`
--

LOCK TABLES `tbl_job_title` WRITE;
/*!40000 ALTER TABLE `tbl_job_title` DISABLE KEYS */;
INSERT INTO `tbl_job_title` VALUES (1,'Material Controller',1,1,1,1),(2,'Gramar Lacsina',0,1,0,1),(3,'Gramar',0,0,0,0),(4,'Prostitute',0,1,0,1),(5,'luigi',0,1,0,1),(6,'Manager',0,1,0,1),(7,'Manager',0,0,0,0);
/*!40000 ALTER TABLE `tbl_job_title` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_live_bidder`
--

DROP TABLE IF EXISTS `tbl_live_bidder`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_live_bidder` (
  `intLiveBidderID` int(8) NOT NULL AUTO_INCREMENT,
  `intLBAuctionID` int(6) DEFAULT NULL,
  `strName` varchar(100) DEFAULT NULL,
  `strAddress` longtext,
  `strContact` varchar(20) DEFAULT NULL,
  `strBidderNumber` varchar(3) DEFAULT NULL,
  `intLBConsignorID` varchar(20) DEFAULT NULL,
  `strIDType` varchar(100) DEFAULT NULL,
  `strIDNumber` varchar(20) DEFAULT NULL,
  `booStatus` tinyint(1) DEFAULT '0',
  `strTelephone` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`intLiveBidderID`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_live_bidder`
--

LOCK TABLES `tbl_live_bidder` WRITE;
/*!40000 ALTER TABLE `tbl_live_bidder` DISABLE KEYS */;
INSERT INTO `tbl_live_bidder` VALUES (10,2,'asd asd asd','asd','(+63) 111 111-1111','1','1','Overseas Worker\'s Welfare Administration (OWWA) ID','111',0,'123-1231'),(11,2,'Fritz Sunga Santuico','Valenzuela','(+63) 999 999-9999','999','','Alien Certificate of Registration (ACR I-Card)','90-123',0,''),(12,2,'asd asd asd','asd','(+63) 999 999-9999','9','','Passport','asd',0,'999-9999'),(13,6,'Gramar D Lacsina','Punta Sta. Ana, Manila','(+63) 912 345-6789','100','','Philippine National Police (PNP) ID','12427468',0,'627-4132'),(14,6,'Rachel Cabuso Flores','Balut Tondo, Manila','(+63) 924 343-5981','90','','OFW ID','5512',0,'365-8957');
/*!40000 ALTER TABLE `tbl_live_bidder` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_notification`
--

DROP TABLE IF EXISTS `tbl_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_notification` (
  `intNotifID` int(11) NOT NULL AUTO_INCREMENT,
  `strNotifTo` varchar(45) NOT NULL DEFAULT 'Admin',
  `strNotifMessage` varchar(45) NOT NULL,
  `booNotifRead` tinyint(4) NOT NULL,
  `datNotifDate` datetime NOT NULL,
  PRIMARY KEY (`intNotifID`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_notification`
--

LOCK TABLES `tbl_notification` WRITE;
/*!40000 ALTER TABLE `tbl_notification` DISABLE KEYS */;
INSERT INTO `tbl_notification` VALUES (51,'admin','New Consignor sent an application.',1,'2018-10-17 18:36:14'),(52,'admin','New Bidder sent an application.',1,'2018-10-17 18:49:54');
/*!40000 ALTER TABLE `tbl_notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_preset`
--

DROP TABLE IF EXISTS `tbl_preset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_preset` (
  `intMachineLearningID` int(11) NOT NULL AUTO_INCREMENT,
  `strCategory` varchar(30) NOT NULL,
  `jsonAttributes` json NOT NULL,
  `dblOGPrice` double NOT NULL,
  `datYearReleased` year(4) NOT NULL,
  PRIMARY KEY (`intMachineLearningID`)
) ENGINE=InnoDB AUTO_INCREMENT=534 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_preset`
--

LOCK TABLES `tbl_preset` WRITE;
/*!40000 ALTER TABLE `tbl_preset` DISABLE KEYS */;
INSERT INTO `tbl_preset` VALUES (1,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Samsung\", \"Model\": \"SMW12002\", \"Wattage\": \"0-199\"}',5000,2016),(2,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Whirlpool\", \"Model\": \"WPWA4000\", \"Wattage\": \"0-199\"}',25000,2016),(3,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Top Load\", \"Brand\": \"Samsung\", \"Model\": \"ESM3010D\", \"Wattage\": \"0-199\"}',1500,2016),(4,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Top Load\", \"Brand\": \"Whirlpool\", \"Model\": \"LGTP201230\", \"Wattage\": \"0-199\"}',3500,2017),(5,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Top Load\", \"Brand\": \"Samsung\", \"Model\": \"LGTL9000\", \"Wattage\": \"0-199\"}',1500,2008),(6,'Appliances','{\"Item\": \"Electric Fan\", \"Type\": \"Stand Fan\", \"Brand\": \"Hanabishi\", \"Model\": \"HST3D20\", \"Wattage\": \"0-199\"}',1345,2009),(7,'Appliances','{\"Item\": \"Electric Fan\", \"Type\": \"Ceiling Fan\", \"Brand\": \"iWata\", \"Model\": \"CF300\", \"Wattage\": \"0-199\"}',1224,2000),(8,'Appliances','{\"Item\": \"Electric Fan\", \"Type\": \"Wall Fan\", \"Brand\": \"Hanabishi\", \"Model\": \"SWF9020\", \"Wattage\": \"0-199\"}',1222,2009),(9,'Appliances','{\"Item\": \"Electric Fan\", \"Type\": \"Wall Fan\", \"Brand\": \"iWata\", \"Model\": \"P20D10\", \"Wattage\": \"0-199\"}',1300,2006),(10,'Appliances','{\"Item\": \"Electric Fan\", \"Type\": \"Stand Fan\", \"Brand\": \"Hanabishi\", \"Model\": \"SL3018842\", \"Wattage\": \"0-199\"}',1200,2007),(11,'Appliances','{\"Item\": \"Stove\", \"Type\": \"Double Burner\", \"Brand\": \"Fujidenzo\", \"Model\": \"FDB1000\", \"Wattage\": \"0-199\"}',1222,2005),(12,'Appliances','{\"Item\": \"Stove\", \"Type\": \"Electric Double Flat Top\", \"Brand\": \"Whirlpool\", \"Model\": \"ED24000\", \"Wattage\": \"200-399\"}',2000,2006),(13,'Appliances','{\"Item\": \"Stove\", \"Type\": \"Electric Coil Top\", \"Brand\": \"Fujidenzo\", \"Model\": \"ECT9050\", \"Wattage\": \"200-399\"}',123,2009),(14,'Appliances','{\"Item\": \"Stove\", \"Type\": \"Single Burner\", \"Brand\": \"Whirlpool\", \"Model\": \"SBY40D10\", \"Wattage\": \"0-199\"}',1234,2010),(15,'Appliances','{\"Item\": \"Stove\", \"Type\": \"Double Burner\", \"Brand\": \"Fujidenzo\", \"Model\": \"PT90AJ31\", \"Wattage\": \"0-199\"}',1233,2009),(16,'Appliances','{\"Item\": \"Stove\", \"Type\": \"Electric Single Flat Top\", \"Brand\": \"Whirlpool\", \"Model\": \"J310KA1\", \"Wattage\": \"0-199\"}',4800,2011),(17,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Microwave Oven\", \"Brand\": \"Imarflex\", \"Model\": \"MCI98384\", \"Wattage\": \"200-399\"}',5000,2012),(18,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Oven Toaster\", \"Brand\": \"Hanabishi\", \"Model\": \"KD0121KAS\", \"Wattage\": \"0-199\"}',1500,2013),(19,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Oven\", \"Brand\": \"Imarflex\", \"Model\": \"9H2BB120\", \"Wattage\": \"0-199\"}',65000,2014),(20,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Microwave Oven\", \"Brand\": \"Hanabishi\", \"Model\": \"LK99821\", \"Wattage\": \"0-199\"}',5000,2015),(21,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Oven Toaster\", \"Brand\": \"Imarflex\", \"Model\": \"PG3KJSN2\", \"Wattage\": \"200-399\"}',1500,2016),(22,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Oven\", \"Brand\": \"Hanabishi\", \"Model\": \"OP12NG3A\", \"Wattage\": \"200-399\"}',5000,2017),(23,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"Standard\", \"Brand\": \"Condura\", \"Model\": \"CD01PO2\", \"Wattage\": \"400-599\"}',4806,2018),(24,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"Standard\", \"Brand\": \"Panasonic\", \"Model\": \"KL98AI00\", \"Wattage\": \"400-599\"}',5000,2011),(25,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"Freezer\", \"Brand\": \"Condura\", \"Model\": \"HI12000\", \"Wattage\": \"400-599\"}',5000,2010),(26,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"Freezer\", \"Brand\": \"Panasonic\", \"Model\": \"NM83GD0\", \"Wattage\": \"400-599\"}',5000,2009),(27,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"2in1\", \"Brand\": \"Condura\", \"Model\": \"DJ03JLA9\", \"Wattage\": \"400-599\"}',25000,2008),(28,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"2in1\", \"Brand\": \"Panasonic\", \"Model\": \"LD83MM09\", \"Wattage\": \"400-599\"}',15000,2007),(29,'Appliances','{\"Item\": \"Television\", \"Type\": \"LED\", \"Brand\": \"Samsung\", \"Model\": \"LD920AM\", \"Wattage\": \"600-799\"}',50000,2006),(30,'Appliances','{\"Item\": \"Television\", \"Type\": \"LED\", \"Brand\": \"LG\", \"Model\": \"KS802LD\", \"Wattage\": \"600-799\"}',50000,2005),(31,'Appliances','{\"Item\": \"Television\", \"Type\": \"Smart TV\", \"Brand\": \"Samsung\", \"Model\": \"MC73KDH\", \"Wattage\": \"600-799\"}',65000,2004),(32,'Appliances','{\"Item\": \"Television\", \"Type\": \"Smart TV\", \"Brand\": \"LG\", \"Model\": \"HS92JST8\", \"Wattage\": \"600-799\"}',100000,2003),(33,'Appliances','{\"Item\": \"Television\", \"Type\": \"LCD\", \"Brand\": \"Samsung\", \"Model\": \"MC9280DKH\", \"Wattage\": \"600-799\"}',25000,2002),(34,'Appliances','{\"Item\": \"Television\", \"Type\": \"LCD\", \"Brand\": \"LG\", \"Model\": \"P29AJDM90\", \"Wattage\": \"600-799\"}',35000,2001),(35,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Jansport\", \"Model\": \"Right Pack Backpack\", \"Material\": \"Polyester\"}',1500,2000),(36,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Jansport\", \"Model\": \"Right Pack Expressions Backpack\", \"Material\": \"Fabric\"}',2500,1999),(37,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Jansport\", \"Model\": \"Cool Pack Backpack\", \"Material\": \"Leather\"}',1500,2010),(38,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Hawk\", \"Model\": \"4920 - BP\", \"Material\": \"Leather\"}',2500,2018),(39,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Hawk\", \"Model\": \"4817 - BP\", \"Material\": \"Polyester\"}',3500,2017),(40,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Hawk\", \"Model\": \"4916 - BP\", \"Material\": \"Fabric\"}',1500,2016),(41,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Gucci\", \"Model\": \"DP02JS90\", \"Material\": \"Leather\"}',45000,2015),(42,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Gucci\", \"Model\": \"MX902JSH2\", \"Material\": \"Synthetic Leather\"}',45000,2014),(43,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Coach\", \"Model\": \"PXK38SM4\", \"Material\": \"Leather\"}',6500,2013),(44,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Coach\", \"Model\": \"0SNYR731\", \"Material\": \"Synthetic Leather\"}',4800,2012),(45,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Anello\", \"Model\": \"A99021\", \"Material\": \"Leather\"}',8000,2011),(46,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Anello\", \"Model\": \"ALO9201\", \"Material\": \"Synthetic Leather\"}',3500,2010),(47,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Nike\", \"Model\": \"PSK380AM\", \"Material\": \"Polyester\"}',2500,2009),(48,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Nike\", \"Model\": \"ALC3027D\", \"Material\": \"Fabric\"}',3500,2008),(49,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Nike\", \"Model\": \"LOP20921\", \"Material\": \"Polyester\"}',1500,2007),(50,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Adidas\", \"Model\": \"DNV303MD\", \"Material\": \"Fabric\"}',2500,2006),(51,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Adidas\", \"Model\": \"02KDN283\", \"Material\": \"Polyester\"}',2500,2005),(52,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Adidas\", \"Model\": \"L021KS82\", \"Material\": \"Fabric\"}',3000,2004),(53,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"UnderArmour\", \"Model\": \"PAK38Q0Q\", \"Material\": \"Polyester\"}',4500,2003),(54,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"UnderArmour\", \"Model\": \"MD83LDB3\", \"Material\": \"Fabric\"}',3500,2002),(55,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"UnderArmour\", \"Model\": \"SMV8EPDMG\", \"Material\": \"Polyester\"}',6500,2001),(56,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"Converse\", \"Model\": \"94NF73KDH\", \"Material\": \"Fabric\"}',2000,2000),(57,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"Converse\", \"Model\": \"93FKDY6EM\", \"Material\": \"Polyester\"}',5000,2001),(58,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"Converse\", \"Model\": \"KD83LDHY\", \"Material\": \"Fabric\"}',3500,2002),(59,'Camera','{\"Item\": \"DSLR\", \"Lens\": \"Standard Lens\", \"Brand\": \"Nikon\", \"Model\": \"D500\"}',65000,2003),(60,'Camera','{\"Item\": \"DSLR\", \"Lens\": \"Standard Lens\", \"Brand\": \"Nikon\", \"Model\": \"D700\"}',35000,2004),(61,'Camera','{\"Item\": \"DSLR\", \"Lens\": \"Wide Lens\", \"Brand\": \"Nikon\", \"Model\": \"D500\"}',15000,2005),(62,'Camera','{\"Item\": \"DSLR\", \"Lens\": \"Standard Lens\", \"Brand\": \"Canon\", \"Model\": \"L300\"}',35000,2006),(63,'Camera','{\"Item\": \"DSLR\", \"Lens\": \"Standard Lens\", \"Brand\": \"Canon\", \"Model\": \"L200\"}',15000,2007),(64,'Camera','{\"Item\": \"DSLR\", \"Lens\": \"Wide Lens\", \"Brand\": \"Canon\", \"Model\": \"L300\"}',15000,2007),(65,'Camera','{\"Item\": \"Digital Camera\", \"Lens\": \"Standard Lens\", \"Brand\": \"Sony\", \"Model\": \"S850\"}',65000,2008),(66,'Camera','{\"Item\": \"Digital Camera\", \"Lens\": \"Wide Lens\", \"Brand\": \"Sony\", \"Model\": \"S800\"}',45000,2009),(67,'Camera','{\"Item\": \"Digital Camera\", \"Lens\": \"Standard Lens\", \"Brand\": \"Sony\", \"Model\": \"S700\"}',15000,2010),(68,'Camera','{\"Item\": \"Digital Camera\", \"Lens\": \"Standard Lens\", \"Brand\": \"Fujitsu\", \"Model\": \"DR100\"}',25000,2011),(69,'Camera','{\"Item\": \"Digital Camera\", \"Lens\": \"Wide Lens\", \"Brand\": \"Fujitsu\", \"Model\": \"DR200\"}',25000,2009),(70,'Camera','{\"Item\": \"Digital Camera\", \"Lens\": \"Standard Lens\", \"Brand\": \"Fujitsu\", \"Model\": \"DR400\"}',15000,2000),(71,'Camera','{\"Item\": \"Action Camera\", \"Lens\": \"Standard Lens\", \"Brand\": \"GoPro\", \"Model\": \"GoPro 5\"}',15000,2008),(72,'Camera','{\"Item\": \"Action Camera\", \"Lens\": \"Standard Lens\", \"Brand\": \"GoPro\", \"Model\": \"GoPro 4\"}',35000,2007),(73,'Camera','{\"Item\": \"Action Camera\", \"Lens\": \"Standard Lens\", \"Brand\": \"GoPro\", \"Model\": \"GoPro 5\"}',46000,2007),(74,'Camera','{\"Item\": \"Action Camera\", \"Lens\": \"Standard Lens\", \"Brand\": \"GoPro\", \"Model\": \"GoPro 2\"}',15000,2006),(75,'Camera','{\"Item\": \"Action Camera\", \"Lens\": \"Standard Lens\", \"Brand\": \"GoPro\", \"Model\": \"GoPro 3\"}',34000,2005),(76,'Camera','{\"Item\": \"Action Camera\", \"Lens\": \"Standard Lens\", \"Brand\": \"GoPro\", \"Model\": \"GoPro 2\"}',15000,2005),(77,'Camera','{\"Item\": \"Polariod\", \"Lens\": \"Telephoto Lens\", \"Brand\": \"Instax\", \"Model\": \"PG500\"}',35000,2004),(78,'Camera','{\"Item\": \"Polariod\", \"Lens\": \"Telephoto Lens\", \"Brand\": \"Instax\", \"Model\": \"SL200\"}',50000,2003),(79,'Camera','{\"Item\": \"Polariod\", \"Lens\": \"Telephoto Lens\", \"Brand\": \"Instax\", \"Model\": \"PG500\"}',24000,2002),(80,'Camera','{\"Item\": \"Polariod\", \"Lens\": \"Telephoto Lens\", \"Brand\": \"Canon\", \"Model\": \"M300\"}',15000,2001),(81,'Camera','{\"Item\": \"Polariod\", \"Lens\": \"Telephoto Lens\", \"Brand\": \"Canon\", \"Model\": \"X200\"}',24000,2000),(82,'Camera','{\"Item\": \"Polariod\", \"Lens\": \"Telephoto Lens\", \"Brand\": \"Canon\", \"Model\": \"M500\"}',15000,2009),(83,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"Laptop\", \"Brand\": \"HP\", \"Model\": \"OMEN\", \"Storage\": \"1 TB and above\", \"Processor\": \"i5 7th Gen\", \"Unit of Measure in Storage\": \"TB\"}',45000,2010),(84,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"Laptop\", \"Brand\": \"HP\", \"Model\": \"Pavilion\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 8th Gen\", \"Unit of Measure in Storage\": \"GB\"}',25000,2011),(85,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"Laptop\", \"Brand\": \"HP\", \"Model\": \"OMEN\", \"Storage\": \"0-500 GB\", \"Processor\": \"i7 6th Gen\", \"Unit of Measure in Storage\": \"GB\"}',21000,2012),(86,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"Laptop\", \"Brand\": \"Dell\", \"Model\": \"XPS 15\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 5th Gen\", \"Unit of Measure in Storage\": \"GB\"}',26000,2013),(87,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"Laptop\", \"Brand\": \"Dell\", \"Model\": \"XPS 17\", \"Storage\": \"1 TB and above\", \"Processor\": \"i3 6th Gen\", \"Unit of Measure in Storage\": \"TB\"}',65000,2014),(88,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"Laptop\", \"Brand\": \"Dell\", \"Model\": \"XPS 15\", \"Storage\": \"1 TB and above\", \"Processor\": \"i7 8th Gen\", \"Unit of Measure in Storage\": \"TB\"}',34500,2015),(89,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"ChromeBook\", \"Brand\": \"Asus\", \"Model\": \"8150\", \"Storage\": \"1 TB and above\", \"Processor\": \"i7 7th Gen\", \"Unit of Measure in Storage\": \"GB\"}',15000,2016),(90,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"ChromeBook\", \"Brand\": \"Asus\", \"Model\": \"9210\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 6th Gen\", \"Unit of Measure in Storage\": \"GB\"}',14000,2017),(91,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"ChromeBook\", \"Brand\": \"Asus\", \"Model\": \"5630\", \"Storage\": \"0-500 GB\", \"Processor\": \"i5 7th Gen\", \"Unit of Measure in Storage\": \"GB\"}',13000,2018),(92,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"ChromeBook\", \"Brand\": \"Acer\", \"Model\": \"N50Ti\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 8th Gen\", \"Unit of Measure in Storage\": \"GB\"}',15500,2013),(93,'Computer Machine','{\"Ram\": \"16\", \"Item\": \"ChromeBook\", \"Brand\": \"Acer\", \"Model\": \"N50Ti\", \"Storage\": \"1 TB and above\", \"Processor\": \"i7 8th Gen\", \"Unit of Measure in Storage\": \"GB\"}',50000,2014),(94,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"ChromeBook\", \"Brand\": \"Acer\", \"Model\": \"N50Ti\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 6th Gen\", \"Unit of Measure in Storage\": \"GB\"}',15000,2015),(95,'Computer Machine','{\"Ram\": \"16\", \"Item\": \"Notebook\", \"Brand\": \"Apple\", \"Model\": \"MacBook Air\", \"Storage\": \"0-500 GB\", \"Processor\": \"i5 7th Gen\", \"Unit of Measure in Storage\": \"GB\"}',35000,2015),(96,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"Notebook\", \"Brand\": \"Apple\", \"Model\": \"MacBook\", \"Storage\": \"0-500 GB\", \"Processor\": \"i5 7th Gen\", \"Unit of Measure in Storage\": \"GB\"}',35000,2016),(97,'Computer Machine','{\"Ram\": \"32\", \"Item\": \"Notebook\", \"Brand\": \"Apple\", \"Model\": \"MacBook Air\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 6th Gen\", \"Unit of Measure in Storage\": \"GB\"}',32000,2014),(98,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"Notebook\", \"Brand\": \"Circle\", \"Model\": \"L20\", \"Storage\": \"0-500 GB\", \"Processor\": \"i5 7th Gen\", \"Unit of Measure in Storage\": \"GB\"}',15000,2011),(99,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"Notebook\", \"Brand\": \"Circle\", \"Model\": \"L30\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 6th Gen\", \"Unit of Measure in Storage\": \"GB\"}',12000,2012),(100,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"Notebook\", \"Brand\": \"Circle\", \"Model\": \"L20\", \"Storage\": \"0-500 GB\", \"Processor\": \"i7 5th Gen\", \"Unit of Measure in Storage\": \"GB\"}',35000,2011),(101,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"2in1 Laptop\", \"Brand\": \"Lenovo\", \"Model\": \"320\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 5th Gen\", \"Unit of Measure in Storage\": \"GB\"}',15550,2013),(102,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"2in1 Laptop\", \"Brand\": \"Lenovo\", \"Model\": \"310\", \"Storage\": \"1 TB and above\", \"Processor\": \"i3 6th Gen\", \"Unit of Measure in Storage\": \"TB\"}',45000,2015),(103,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"2in1 Laptop\", \"Brand\": \"Lenovo\", \"Model\": \"320\", \"Storage\": \"0-500 GB\", \"Processor\": \"i5 7th Gen\", \"Unit of Measure in Storage\": \"GB\"}',65000,2016),(104,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"2in1 Laptop\", \"Brand\": \"RedFox\", \"Model\": \"KF93LS2\", \"Storage\": \"0-500 GB\", \"Processor\": \"intel 3rd Gen\", \"Unit of Measure in Storage\": \"GB\"}',45000,2017),(105,'Computer Machine','{\"Ram\": \"2\", \"Item\": \"2in1 Laptop\", \"Brand\": \"RedFox\", \"Model\": \"L230S3\", \"Storage\": \"0-500 GB\", \"Processor\": \"intel 4th Gen\", \"Unit of Measure in Storage\": \"GB\"}',24000,2018),(106,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"2in1 Laptop\", \"Brand\": \"RedFox\", \"Model\": \"L300SJ3\", \"Storage\": \"1 TB and above\", \"Processor\": \"intel 4th Gen\", \"Unit of Measure in Storage\": \"TB\"}',15000,2018),(107,'Computer Machine','{\"Ram\": \"16\", \"Item\": \"System Unit\", \"Brand\": \"Dell\", \"Model\": \"K30DRJ4\", \"Storage\": \"1 TB and above\", \"Processor\": \"i7 8th Gen\", \"Unit of Measure in Storage\": \"TB\"}',15330,2012),(108,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"System Unit\", \"Brand\": \"Dell\", \"Model\": \"JD94J6L\", \"Storage\": \"1 TB and above 2 HDD\", \"Processor\": \"i5 4th Gen\", \"Unit of Measure in Storage\": \"TB\"}',15000,2011),(109,'Computer Machine','{\"Ram\": \"32\", \"Item\": \"System Unit\", \"Brand\": \"Dell\", \"Model\": \"K30DRJ4\", \"Storage\": \"1 TB and above\", \"Processor\": \"i9 7th Gen\", \"Unit of Measure in Storage\": \"TB\"}',45000,2012),(110,'Computer Machine','{\"Ram\": \"32\", \"Item\": \"System Unit\", \"Brand\": \"HP\", \"Model\": \"JEK4MFO3\", \"Storage\": \"1 TB and above\", \"Processor\": \"Core2Duo\", \"Unit of Measure in Storage\": \"TB\"}',25000,2014),(111,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"System Unit\", \"Brand\": \"HP\", \"Model\": \"L3NF93MF\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 7th Gen\", \"Unit of Measure in Storage\": \"GB\"}',26000,2014),(112,'Computer Machine','{\"Ram\": \"32 and above\", \"Item\": \"System Unit\", \"Brand\": \"HP\", \"Model\": \"JEK4MFO3\", \"Storage\": \"0-500 GB\", \"Processor\": \"Core2Duo\", \"Unit of Measure in Storage\": \"GB\"}',150000,2013),(113,'Furniture','{\"Item\": \"Desk\", \"Type\": \"Writing  Desk\", \"Brand\": \"IKEA\", \"Style\": \"Modern\", \"Material\": \"Wood(Mahogany)\"}',1530,2015),(114,'Furniture','{\"Item\": \"Desk\", \"Type\": \"Office  Desk\", \"Brand\": \"IKEA\", \"Style\": \"Minimalist\", \"Material\": \"Wood(Narra)\"}',1500,2015),(115,'Furniture','{\"Item\": \"Desk\", \"Type\": \"Computer  Desk\", \"Brand\": \"IKEA\", \"Style\": \"Traditional\", \"Material\": \"Plastic\"}',3500,2015),(116,'Furniture','{\"Item\": \"Desk\", \"Type\": \"Writing  Desk\", \"Brand\": \"Custom-Made\", \"Style\": \"Modern\", \"Material\": \"Wood(Mahogany)\"}',3500,2015),(117,'Furniture','{\"Item\": \"Desk\", \"Type\": \"Office  Desk\", \"Brand\": \"Custom-Made\", \"Style\": \"Modern\", \"Material\": \"Plastic\"}',1500,2016),(118,'Furniture','{\"Item\": \"Desk\", \"Type\": \"Computer  Desk\", \"Brand\": \"Custom-Made\", \"Style\": \"Modern\", \"Material\": \"Wood(Generic)\"}',4500,2016),(119,'Furniture','{\"Item\": \"Sofa\", \"Type\": \"Sofa Bed\", \"Brand\": \"Uratex\", \"Style\": \"Modern\", \"Material\": \"Fabric\"}',45120,2017),(120,'Furniture','{\"Item\": \"Sofa\", \"Type\": \"Sofa Bed\", \"Brand\": \"Uratex\", \"Style\": \"Modern\", \"Material\": \"Plastic\"}',4510,2011),(121,'Furniture','{\"Item\": \"Sofa\", \"Type\": \"Sofa Bed\", \"Brand\": \"Uratex\", \"Style\": \"Modern\", \"Material\": \"Fabric\"}',6430,2018),(122,'Furniture','{\"Item\": \"Sofa\", \"Type\": \"3 Person Sofa\", \"Brand\": \"IKEA\", \"Style\": \"Transitional\", \"Material\": \"Plastic\"}',15000,2000),(123,'Furniture','{\"Item\": \"Sofa\", \"Type\": \"3 Person Sofa\", \"Brand\": \"IKEA\", \"Style\": \"Transitional\", \"Material\": \"Fabric\"}',4100,2013),(124,'Furniture','{\"Item\": \"Sofa\", \"Type\": \"3 Person Sofa\", \"Brand\": \"IKEA\", \"Style\": \"Transitional\", \"Material\": \"Plastic\"}',4550,2012),(125,'Furniture','{\"Item\": \"Bed\", \"Type\": \"Air Mattress\", \"Brand\": \"Tailee\", \"Style\": \"Modern\", \"Material\": \"Plastic\"}',6500,2014),(126,'Furniture','{\"Item\": \"Bed\", \"Type\": \"Air Mattress\", \"Brand\": \"Hapihomes\", \"Style\": \"Modern\", \"Material\": \"Plastic\"}',1500,2015),(127,'Furniture','{\"Item\": \"Bed\", \"Type\": \"Air Mattress\", \"Brand\": \"San-yang\", \"Style\": \"Modern\", \"Material\": \"Plastic\"}',4522,2016),(128,'Furniture','{\"Item\": \"Bed\", \"Type\": \"Water Mattress\", \"Brand\": \"Tailee\", \"Style\": \"Modern\", \"Material\": \"Plastic\"}',1500,2014),(129,'Furniture','{\"Item\": \"Bed\", \"Type\": \"Water Mattress\", \"Brand\": \"Hapihomes\", \"Style\": \"Modern\", \"Material\": \"Plastic\"}',4500,2014),(130,'Furniture','{\"Item\": \"Bed\", \"Type\": \"Water Mattress\", \"Brand\": \"San-yang\", \"Style\": \"Modern\", \"Material\": \"Plastic\"}',6500,2012),(131,'Furniture','{\"Item\": \"Chairs\", \"Type\": \"Office Chair\", \"Brand\": \"Sumo\", \"Style\": \"Transitional\", \"Material\": \"Plastic\"}',1500,2014),(132,'Furniture','{\"Item\": \"Chairs\", \"Type\": \"Office Chair\", \"Brand\": \"I home\", \"Style\": \"Modern\", \"Material\": \"Fabric\"}',1500,2016),(133,'Furniture','{\"Item\": \"Chairs\", \"Type\": \"Office Chair\", \"Brand\": \"Sumo\", \"Style\": \"Transitional\", \"Material\": \"Plastic\"}',6800,2011),(134,'Furniture','{\"Item\": \"Chairs\", \"Type\": \"Gaming Chair\", \"Brand\": \"I home\", \"Style\": \"Modern\", \"Material\": \"Synthetic Leather\"}',7500,2011),(135,'Furniture','{\"Item\": \"Chairs\", \"Type\": \"Gaming Chair\", \"Brand\": \"Sumo\", \"Style\": \"Transitional\", \"Material\": \"Synthetic Leather\"}',3500,2013),(136,'Furniture','{\"Item\": \"Chairs\", \"Type\": \"Gaming Chair\", \"Brand\": \"I home\", \"Style\": \"Modern\", \"Material\": \"Synthetic Leather\"}',1500,2015),(137,'Furniture','{\"Item\": \"Tables\", \"Type\": \"Dining Table\", \"Brand\": \"Lifetime\", \"Style\": \"Modern\", \"Material\": \"Glass\"}',3500,2012),(138,'Furniture','{\"Item\": \"Tables\", \"Type\": \"Dining Table\", \"Brand\": \"IKEA\", \"Style\": \"Transitional\", \"Material\": \"Plastic\"}',1500,2014),(139,'Furniture','{\"Item\": \"Tables\", \"Type\": \"Dining Table\", \"Brand\": \"Lifetime\", \"Style\": \"Modern\", \"Material\": \"Wood(Lumber)\"}',4500,2011),(140,'Furniture','{\"Item\": \"Tables\", \"Type\": \"Study Table\", \"Brand\": \"IKEA\", \"Style\": \"Classic\", \"Material\": \"Wood(Lumber)\"}',7500,2014),(141,'Furniture','{\"Item\": \"Tables\", \"Type\": \"Study Table\", \"Brand\": \"Lifetime\", \"Style\": \"Modern\", \"Material\": \"Plastic\"}',1500,2014),(142,'Furniture','{\"Item\": \"Tables\", \"Type\": \"Study Table\", \"Brand\": \"IKEA\", \"Style\": \"Modern\", \"Material\": \"Metal\"}',6500,2014),(143,'Furniture','{\"Item\": \"Wardrobe\", \"Type\": \"Cabinet\", \"Brand\": \"Custom-Made\", \"Style\": \"Modern\", \"Material\": \"Wood\"}',4500,2014),(144,'Furniture','{\"Item\": \"Wardrobe\", \"Type\": \"Cabinet\", \"Brand\": \"J&T\", \"Style\": \"Modern\", \"Transitional\": \"Plastic\"}',1500,2014),(145,'Furniture','{\"Item\": \"Wardrobe\", \"Type\": \"Cabinet\", \"Brand\": \"Custom-Made\", \"Style\": \"Classic\", \"Material\": \"Metal\"}',1400,2014),(146,'Furniture','{\"Item\": \"Wardrobe\", \"Type\": \"2 Door Closet\", \"Brand\": \"J&T\", \"Style\": \"Transitional\", \"Material\": \"Wood(Lumber)\"}',5000,2014),(147,'Furniture','{\"Item\": \"Wardrobe\", \"Type\": \"2 Door Closet\", \"Brand\": \"J&T\", \"Style\": \"Modern\", \"Material\": \"Wood(Mahogany)\"}',1400,2014),(148,'Furniture','{\"Item\": \"Wardrobe\", \"Type\": \"2 Door Closet\", \"Brand\": \"Custom-Made\", \"Style\": \"Western\", \"Material\": \"Wood(Lumber)\"}',4100,2014),(167,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Logitech\", \"Model\": \"MC900\"}',1500,2014),(168,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Logitech\", \"Model\": \"PDP200\"}',3500,2014),(169,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Logitech\", \"Model\": \"MCU3500\"}',1500,2014),(170,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Razer\", \"Model\": \"MDI10\"}',9000,2014),(171,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Razer\", \"Model\": \"OG00\"}',15000,2014),(172,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Razer\", \"Model\": \"KD00\"}',6500,2014),(173,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"Dell\", \"Model\": \"P1200\"}',1500,2014),(174,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"Dell\", \"Model\": \"S4500\"}',500,2014),(175,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"Dell\", \"Model\": \"L1500\"}',1500,2014),(176,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"HP\", \"Model\": \"P6200\"}',4500,2014),(177,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"HP\", \"Model\": \"H2500\"}',1200,2014),(178,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"HP\", \"Model\": \"L1300\"}',1200,2015),(179,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Razer\", \"Model\": \"Kraken 200\"}',15000,2015),(180,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Razer\", \"Model\": \"Titan 120\"}',9000,2015),(181,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Razer\", \"Model\": \"Titan 220\"}',9000,2015),(182,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"S500\"}',4800,2015),(183,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"P500\"}',8600,2015),(184,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"MT-500\"}',2600,2015),(185,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"L20P\"}',5300,2015),(186,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"L30P\"}',2500,2016),(187,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"A20P\"}',1500,2016),(188,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Dell\", \"Model\": \"Dell-20P2\"}',500,2016),(189,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Dell\", \"Model\": \"Dell-20P3\"}',1500,2016),(190,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Dell\", \"Model\": \"Dell-20P1\"}',4500,2016),(191,'Generic Gadget','{\"Item\": \"Controller\", \"Brand\": \"Logitech\", \"Model\": \"Logicool-200\"}',6500,2016),(192,'Generic Gadget','{\"Item\": \"Controller\", \"Brand\": \"Logitech\", \"Model\": \"Logicool-300\"}',7500,2016),(193,'Generic Gadget','{\"Item\": \"Controller\", \"Brand\": \"Logitech\", \"Model\": \"Logicool-100\"}',4500,2016),(194,'Generic Gadget','{\"Item\": \"Controller\", \"Brand\": \"Sony\", \"Model\": \"PS3 Controller\"}',1500,2016),(195,'Generic Gadget','{\"Item\": \"Controller\", \"Brand\": \"Sony\", \"Model\": \"PS4 Controller\"}',5000,2016),(196,'Generic Gadget','{\"Item\": \"Controller\", \"Brand\": \"Sony\", \"Model\": \"PS4 Pro Controller\"}',2000,2016),(197,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Apple\", \"Model\": \"iPhone 6 Plus\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',45000,2016),(198,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Apple\", \"Model\": \"iPhone 6 Plus\", \"Storage\": \"64\", \"Unit of Measure in Storage\": \"GB\"}',48000,2016),(199,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Apple\", \"Model\": \"iPhone 5S\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',15000,2016),(200,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Samsung\", \"Model\": \"Galaxy A7\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',9000,2016),(201,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Samsung\", \"Model\": \"Galaxy S8 Plus\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',4800,2016),(202,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Samsung\", \"Model\": \"Galaxy S9 Plus\", \"Storage\": \"64\", \"Unit of Measure in Storage\": \"GB\"}',4000,2016),(203,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Apple\", \"Model\": \"iPad\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',30000,2016),(204,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Apple\", \"Model\": \"iPad Air\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',15000,2016),(205,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Apple\", \"Model\": \"iPad\", \"Storage\": \"64\", \"Unit of Measure in Storage\": \"GB\"}',15000,2016),(206,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Cherry Mobile\", \"Model\": \"Cherry Mobile 620\", \"Storage\": \"2\", \"Unit of Measure in Storage\": \"GB\"}',4500,2016),(207,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Cherry Mobile\", \"Model\": \"Cherry Mobile 820\", \"Storage\": \"8\", \"Unit of Measure in Storage\": \"GB\"}',4000,2016),(208,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Cherry Mobile\", \"Model\": \"Cherry Mobile 120\", \"Storage\": \"4\", \"Unit of Measure in Storage\": \"GB\"}',7800,2017),(209,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"MyPhone\", \"Model\": \"MyPhone 11s\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',6800,2017),(210,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"MyPhone\", \"Model\": \"MyPhone 10s\", \"Storage\": \"16\", \"Unit of Measure in Storage\": \"GB\"}',4800,2017),(211,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"MyPhone\", \"Model\": \"MyPhone 9s\", \"Storage\": \"4\", \"Unit of Measure in Storage\": \"GB\"}',7500,2016),(212,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"Cheryy Mobile\", \"Model\": \"Cheryy Mobile 320\", \"Storage\": \"2\", \"Unit of Measure in Storage\": \"GB\"}',1500,2016),(213,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"Cheryy Mobile\", \"Model\": \"Cheryy Mobile 310\", \"Storage\": \"8\", \"Unit of Measure in Storage\": \"GB\"}',5000,2016),(214,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"Cheryy Mobile\", \"Model\": \"Cheryy Mobile 330\", \"Storage\": \"4\", \"Unit of Measure in Storage\": \"GB\"}',5000,2016),(215,'Mobile','{\"Item\": \"QWERTY Phone\", \"Brand\": \"Black Berry\", \"Model\": \"Black Berry N20\", \"Storage\": \"1\", \"Unit of Measure in Storage\": \"GB\"}',4500,2016),(216,'Mobile','{\"Item\": \"QWERTY Phone\", \"Brand\": \"Black Berry\", \"Model\": \"Black Berry N30\", \"Storage\": \"1\", \"Unit of Measure in Storage\": \"GB\"}',1500,2016),(217,'Mobile','{\"Item\": \"QWERTY Phone\", \"Brand\": \"Black Berry\", \"Model\": \"Black Berry N10\", \"Storage\": \"1\", \"Unit of Measure in Storage\": \"GB\"}',7500,2016),(218,'Mobile','{\"Item\": \"QWERTY Phone\", \"Brand\": \"Nokia\", \"Model\": \"E3\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"MB\"}',4800,2016),(219,'Mobile','{\"Item\": \"QWERTY Phone\", \"Brand\": \"Nokia\", \"Model\": \"A1\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"MB\"}',6500,2010),(220,'Mobile','{\"Item\": \"QWERTY Phone\", \"Brand\": \"Nokia\", \"Model\": \"E2\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"MB\"}',4500,2010),(221,'Shoes','{\"Item\": \"Casual Shoes\", \"Brand\": \"Vans\", \"Model\": \"Vans Pro\", \"Feet Size\": \"10.5\"}',3500,2010),(222,'Shoes','{\"Item\": \"Casual Shoes\", \"Brand\": \"Vans\", \"Model\": \"Vans HalfCab\", \"Feet Size\": \"9\"}',1500,2010),(223,'Shoes','{\"Item\": \"Casual Shoes\", \"Brand\": \"Vans\", \"Model\": \"Vans Sk8-hi\", \"Feet Size\": \"9\"}',4500,2010),(224,'Shoes','{\"Item\": \"Casual Shoes\", \"Brand\": \"Puma\", \"Model\": \"LO3JD3\", \"Feet Size\": \"9.5\"}',4530,2010),(225,'Shoes','{\"Item\": \"Casual Shoes\", \"Brand\": \"Puma\", \"Model\": \"LO2KF6\", \"Feet Size\": \"10\"}',4500,2010),(226,'Shoes','{\"Item\": \"Casual Shoes\", \"Brand\": \"Puma\", \"Model\": \"L93J49\", \"Feet Size\": \"11.5\"}',3500,2010),(227,'Shoes','{\"Item\": \"Running Shoes\", \"Brand\": \"New Balance\", \"Model\": \"NB200A\", \"Feet Size\": \"6.5\"}',1500,2010),(228,'Shoes','{\"Item\": \"Running Shoes\", \"Brand\": \"New Balance\", \"Model\": \"NB300D\", \"Feet Size\": \"7\"}',4100,2010),(229,'Shoes','{\"Item\": \"Running Shoes\", \"Brand\": \"New Balance\", \"Model\": \"NB600V\", \"Feet Size\": \"9\"}',4800,2010),(230,'Shoes','{\"Item\": \"Running Shoes\", \"Brand\": \"Adidas\", \"Model\": \"UltraFoam 3\", \"Feet Size\": \"12\"}',5600,2010),(231,'Shoes','{\"Item\": \"Running Shoes\", \"Brand\": \"Adidas\", \"Model\": \"UltraFoam 1\", \"Feet Size\": \"13\"}',4800,2010),(232,'Shoes','{\"Item\": \"Running Shoes\", \"Brand\": \"Adidas\", \"Model\": \"UltraFoam 2\", \"Feet Size\": \"6\"}',2400,2010),(233,'Shoes','{\"Item\": \"Basket Ball Shoes\", \"Brand\": \"Nike\", \"Model\": \"Kyrie 2\", \"Feet Size\": \"8\"}',4800,2010),(234,'Shoes','{\"Item\": \"Basket Ball Shoes\", \"Brand\": \"Nike\", \"Model\": \"Kobe X\", \"Feet Size\": \"10\"}',5600,2010),(235,'Shoes','{\"Item\": \"Basket Ball Shoes\", \"Brand\": \"Nike\", \"Model\": \"KD 7\", \"Feet Size\": \"8.5\"}',7000,2010),(236,'Shoes','{\"Item\": \"Basket Ball Shoes\", \"Brand\": \"Under Armour\", \"Model\": \"Curry 3\", \"Feet Size\": \"7.5\"}',4000,2010),(237,'Shoes','{\"Item\": \"Basket Ball Shoes\", \"Brand\": \"Under Armour\", \"Model\": \"Curry 4\", \"Feet Size\": \"8.5\"}',6000,2010),(238,'Shoes','{\"Item\": \"Basket Ball Shoes\", \"Brand\": \"Under Armour\", \"Model\": \"Curry 5\", \"Feet Size\": \"10.5\"}',5000,2010),(239,'Shoes','{\"Item\": \"School/Office Shoes\", \"Brand\": \"Rusty Lopez\", \"Model\": \"8172\", \"Feet Size\": \"9.5\"}',700,2010),(240,'Shoes','{\"Item\": \"School/Office Shoes\", \"Brand\": \"Rusty Lopez\", \"Model\": \"9201\", \"Feet Size\": \"9\"}',1000,2010),(241,'Shoes','{\"Item\": \"School/Office Shoes\", \"Brand\": \"Rusty Lopez\", \"Model\": \"4930\", \"Feet Size\": \"9\"}',1500,2010),(242,'Shoes','{\"Item\": \"School/Office Shoes\", \"Brand\": \"CLN\", \"Model\": \"CLN1900\", \"Feet Size\": \"8\"}',2500,2010),(243,'Shoes','{\"Item\": \"School/Office Shoes\", \"Brand\": \"CLN\", \"Model\": \"CLN2000\", \"Feet Size\": \"7\"}',4000,2010),(244,'Shoes','{\"Item\": \"School/Office Shoes\", \"Brand\": \"CLN\", \"Model\": \"CLN4000\", \"Feet Size\": \"6\"}',1500,2009),(245,'Television','{\"Item\": \"Smart TV\", \"Type\": \"LED\", \"Brand\": \"LG\", \"Model\": \"KS802LD\", \"Resolution\": \"1080P\", \"Screensize\": \"70-79\"}',15000,2009),(246,'Television','{\"Item\": \"Smart TV\", \"Type\": \"LCD\", \"Brand\": \"Samsung\", \"Model\": \"MC73KDH\", \"Resolution\": \"Nano Crystal\", \"Screensize\": \"80 and above\"}',1500,2009),(247,'Television','{\"Item\": \"Smart TV\", \"Type\": \"OLED\", \"Brand\": \"LG\", \"Model\": \"HS92JST8\", \"Resolution\": \"720P\", \"Screensize\": \"60-69\"}',78000,2009),(248,'Television','{\"Item\": \"Flat Screen\", \"Type\": \"LED\", \"Brand\": \"Samsung\", \"Model\": \"MC9280DKH\", \"Resolution\": \"4K\", \"Screensize\": \"50-59\"}',65000,2009),(249,'Television','{\"Item\": \"Flat Screen\", \"Type\": \"LCD\", \"Brand\": \"LG\", \"Model\": \"P29AJDM90\", \"Resolution\": \"1080P\", \"Screensize\": \"70-79\"}',45000,2009),(250,'Television','{\"Item\": \"Flat Screen\", \"Type\": \"OLED\", \"Brand\": \"Samsung\", \"Model\": \"LS93NS92\", \"Resolution\": \"Nano Crystal\", \"Screensize\": \"80 and above\"}',45000,2009),(251,'Television','{\"Item\": \"Smart TV\", \"Type\": \"OLED\", \"Brand\": \"LG\", \"Model\": \"SU03JDY\", \"Resolution\": \"720P\", \"Screensize\": \"80 and above\"}',50000,2009),(252,'Television','{\"Item\": \"Flat Screen\", \"Type\": \"LED\", \"Brand\": \"Samsung\", \"Model\": \"SK38ALEU3\", \"Resolution\": \"4K\", \"Screensize\": \"40-49\"}',85200,2009),(253,'Toys','{\"Item\": \"Remote Control Car\", \"Brand\": \"Bandai\"}',9856,2009),(254,'Toys','{\"Item\": \"Remote Control Car\", \"Brand\": \"CAT\"}',6542,2009),(255,'Toys','{\"Item\": \"Remote Control Car\", \"Brand\": \"Hot Wheels\"}',6521,2009),(256,'Toys','{\"Item\": \"Remote Control Car\", \"Brand\": \"Petron\"}',8741,2009),(257,'Toys','{\"Item\": \"Remote Control Car\", \"Brand\": \"Shell\"}',8521,2009),(258,'Toys','{\"Item\": \"Stuff Toys\", \"Brand\": \"Blue Magic\"}',9741,2009),(259,'Toys','{\"Item\": \"Stuff Toys\", \"Brand\": \"Nintedo\"}',6720,2009),(260,'Toys','{\"Item\": \"Stuff Toys\", \"Brand\": \"Disney\"}',4510,2009),(261,'Toys','{\"Item\": \"Stuff Toys\", \"Brand\": \"Cartoon Network\"}',4500,2009),(262,'Toys','{\"Item\": \"Stuff Toys\", \"Brand\": \"Nickelodeon\"}',5200,2009),(263,'Toys','{\"Item\": \"Action Figure\", \"Brand\": \"Marvel\"}',4800,2009),(264,'Toys','{\"Item\": \"Action Figure\", \"Brand\": \"DC\"}',6500,2009),(265,'Toys','{\"Item\": \"Action Figure\", \"Brand\": \"Nickelodeon\"}',1500,2009),(266,'Toys','{\"Item\": \"Action Figure\", \"Brand\": \"Bandai\"}',4800,2009),(267,'Toys','{\"Item\": \"Action Figure\", \"Brand\": \"Disney\"}',5600,2009),(268,'Toys','{\"Item\": \"Dolls\", \"Brand\": \"Disney\"}',250,2009),(269,'Toys','{\"Item\": \"Dolls\", \"Brand\": \"Barbie\"}',300,2009),(270,'Toys','{\"Item\": \"Dolls\", \"Brand\": \"Nickelodeon\"}',400,2013),(271,'Toys','{\"Item\": \"Dolls\", \"Brand\": \"Pixar\"}',1500,2013),(272,'Toys','{\"Item\": \"Dolls\", \"Brand\": \"Strawberry Shortcake\"}',2000,2013),(273,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Samsung\", \"Model\": \"SMW12002\", \"Wattage\": \"600-799\"}',4800,2013),(274,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Whirlpool\", \"Model\": \"DM40NDN3\", \"Wattage\": \"800-999\"}',8500,2013),(275,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Top Load\", \"Brand\": \"Samsung\", \"Model\": \"SJD883DL3\", \"Wattage\": \"800-999\"}',4500,2013),(276,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Top Load\", \"Brand\": \"Whirlpool\", \"Model\": \"MF9EN4JDL\", \"Wattage\": \"800-999\"}',4500,2013),(277,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Top Load\", \"Brand\": \"Samsung\", \"Model\": \"KIDJ4DHD8E\", \"Wattage\": \"800-999\"}',6500,2013),(278,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Samsung\", \"Model\": \"DJE8RNFD9\", \"Wattage\": \"800-999\"}',8550,2013),(279,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Front Load\", \"Brand\": \"Whirlpool\", \"Model\": \"94DLUJRO\", \"Wattage\": \"800-999\"}',7500,2013),(280,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Top Load\", \"Brand\": \"Samsung\", \"Model\": \"LD93MMDO83\", \"Wattage\": \"800-999\"}',5000,2013),(281,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Top Load\", \"Brand\": \"Whirlpool\", \"Model\": \"94MDL4DD8\", \"Wattage\": \"800-999\"}',5000,2013),(282,'Appliances','{\"Item\": \"Washing Machine\", \"Type\": \"Top Load\", \"Brand\": \"Samsung\", \"Model\": \"\", \"Wattage\": \"0-199\"}',10000,2013),(283,'Appliances','{\"Item\": \"Electric Fan\", \"Type\": \"Stand Fan\", \"Brand\": \"Hanabishi\", \"Model\": \"LD03JDO3\", \"Wattage\": \"0-199\"}',1500,2013),(284,'Appliances','{\"Item\": \"Electric Fan\", \"Type\": \"Ceiling Fan\", \"Brand\": \"iWata\", \"Model\": \"D93KDOA\", \"Wattage\": \"0-199\"}',2500,2013),(285,'Appliances','{\"Item\": \"Electric Fan\", \"Type\": \"Wall Fan\", \"Brand\": \"Hanabishi\", \"Model\": \"D3LD0DL\", \"Wattage\": \"0-199\"}',2000,2013),(286,'Appliances','{\"Item\": \"Electric Fan\", \"Type\": \"Wall Fan\", \"Brand\": \"iWata\", \"Model\": \"LD93ND3\", \"Wattage\": \"0-199\"}',1500,2013),(287,'Appliances','{\"Item\": \"Electric Fan\", \"Type\": \"Stand Fan\", \"Brand\": \"Hanabishi\", \"Model\": \"MCUEMD30\", \"Wattage\": \"0-199\"}',1500,2013),(288,'Appliances','{\"Item\": \"Electric Fan\", \"Type\": \"Stand Fan\", \"Brand\": \"Hanabishi\", \"Model\": \"DK3300\", \"Wattage\": \"0-199\"}',2000,2013),(289,'Appliances','{\"Item\": \"Electric Fan\", \"Type\": \"Ceiling Fan\", \"Brand\": \"iWata\", \"Model\": \"CNE8SD3\", \"Wattage\": \"0-199\"}',5000,2013),(290,'Appliances','{\"Item\": \"Electric Fan\", \"Type\": \"Wall Fan\", \"Brand\": \"Hanabishi\", \"Model\": \"POENOMDP\", \"Wattage\": \"0-199\"}',700,2013),(291,'Appliances','{\"Item\": \"Electric Fan\", \"Type\": \"Wall Fan\", \"Brand\": \"iWata\", \"Model\": \"PTIDMITDL\", \"Wattage\": \"0-199\"}',2000,2013),(292,'Appliances','{\"Item\": \"Electric Fan\", \"Type\": \"Stand Fan\", \"Brand\": \"Hanabishi\", \"Model\": \"ADO9EDPL\", \"Wattage\": \"0-199\"}',700,2013),(293,'Appliances','{\"Item\": \"Stove\", \"Type\": \"Double Burner\", \"Brand\": \"Fujidenzo\", \"Model\": \"93KDSJD0\", \"Wattage\": \"0-199\"}',1500,2013),(294,'Appliances','{\"Item\": \"Stove\", \"Type\": \"Electric Double Flat Top\", \"Brand\": \"Whirlpool\", \"Model\": \"D92KDI3KD\", \"Wattage\": \"0-199\"}',26000,2013),(295,'Appliances','{\"Item\": \"Stove\", \"Type\": \"Electric Coil Top\", \"Brand\": \"Fujidenzo\", \"Model\": \"EKD03KDK\", \"Wattage\": \"0-199\"}',2500,2013),(296,'Appliances','{\"Item\": \"Stove\", \"Type\": \"Single Burner\", \"Brand\": \"Whirlpool\", \"Model\": \"KD0EKDP3\", \"Wattage\": \"0-199\"}',1500,2013),(297,'Appliances','{\"Item\": \"Stove\", \"Type\": \"Double Burner\", \"Brand\": \"Fujidenzo\", \"Model\": \"93DID9K\", \"Wattage\": \"0-199\"}',2000,2015),(298,'Appliances','{\"Item\": \"Stove\", \"Type\": \"Double Burner\", \"Brand\": \"Fujidenzo\", \"Model\": \"LD03L03JX\", \"Wattage\": \"0-199\"}',2000,2015),(299,'Appliances','{\"Item\": \"Stove\", \"Type\": \"Electric Double Flat Top\", \"Brand\": \"Whirlpool\", \"Model\": \"03KDSND3\", \"Wattage\": \"0-199\"}',25000,2015),(300,'Appliances','{\"Item\": \"Stove\", \"Type\": \"Electric Coil Top\", \"Brand\": \"Fujidenzo\", \"Model\": \"D93LS93\", \"Wattage\": \"0-199\"}',1500,2015),(301,'Appliances','{\"Item\": \"Stove\", \"Type\": \"Single Burner\", \"Brand\": \"Whirlpool\", \"Model\": \"DI30D50\", \"Wattage\": \"0-199\"}',1000,2015),(302,'Appliances','{\"Item\": \"Stove\", \"Type\": \"Double Burner\", \"Brand\": \"Fujidenzo\", \"Model\": \"HG93KD0\", \"Wattage\": \"0-199\"}',1500,2015),(303,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Microwave Oven\", \"Brand\": \"Imarflex\", \"Model\": \"LD03KD3\", \"Wattage\": \"0-199\"}',1500,2015),(304,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Oven Toaster\", \"Brand\": \"Hanabishi\", \"Model\": \"JDMO4OD03\", \"Wattage\": \"0-199\"}',6510,2015),(305,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Oven\", \"Brand\": \"Imarflex\", \"Model\": \"AS9E9EKD\", \"Wattage\": \"0-199\"}',45000,2015),(306,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Microwave Oven\", \"Brand\": \"Hanabishi\", \"Model\": \"94K0D3LD\", \"Wattage\": \"0-199\"}',25000,2015),(307,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Oven Toaster\", \"Brand\": \"Imarflex\", \"Model\": \"I94KD3L\", \"Wattage\": \"1000-1999\"}',1500,2015),(308,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Oven\", \"Brand\": \"Hanabishi\", \"Model\": \"LE0DDI4\", \"Wattage\": \"1000-1999\"}',50000,2015),(309,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Microwave Oven\", \"Brand\": \"Imarflex\", \"Model\": \"LD94KDK4\", \"Wattage\": \"0-199\"}',10000,2015),(310,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Oven Toaster\", \"Brand\": \"Hanabishi\", \"Model\": \"NB93S94\", \"Wattage\": \"0-199\"}',2000,2015),(311,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Oven\", \"Brand\": \"Imarflex\", \"Model\": \"93KDL3LD0\", \"Wattage\": \"0-199\"}',65000,2015),(312,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Microwave Oven\", \"Brand\": \"Hanabishi\", \"Model\": \"MD93LD03\", \"Wattage\": \"0-199\"}',5000,2015),(313,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Oven Toaster\", \"Brand\": \"Imarflex\", \"Model\": \"IE93KDD3\", \"Wattage\": \"1000-1999\"}',2300,2015),(314,'Appliances','{\"Item\": \"Oven\", \"Type\": \"Oven\", \"Brand\": \"Hanabishi\", \"Model\": \"MV9ELDPD0\", \"Wattage\": \"0-199\"}',45000,2015),(315,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"Standard\", \"Brand\": \"Condura\", \"Model\": \"LD0JG94\", \"Wattage\": \"0-199\"}',20000,2015),(316,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"Standard\", \"Brand\": \"Panasonic\", \"Model\": \"MAFI40SA\", \"Wattage\": \"0-199\"}',25000,2015),(317,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"Freezer\", \"Brand\": \"Condura\", \"Model\": \"M03A500\", \"Wattage\": \"0-199\"}',45000,2015),(318,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"Freezer\", \"Brand\": \"Panasonic\", \"Model\": \"MD93LD03\", \"Wattage\": \"0-199\"}',25000,2015),(319,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"2in1\", \"Brand\": \"Condura\", \"Model\": \"JF85HF7S\", \"Wattage\": \"2000-4000\"}',35000,2015),(320,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"2in1\", \"Brand\": \"Panasonic\", \"Model\": \"DM1LAJG6\", \"Wattage\": \"2000-4000\"}',45000,2015),(321,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"Standard\", \"Brand\": \"Condura\", \"Model\": \"NFKD8DJ4\", \"Wattage\": \"2000-4000\"}',15000,2015),(322,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"Standard\", \"Brand\": \"Panasonic\", \"Model\": \"KD93VN45\", \"Wattage\": \"2000-4000\"}',35000,2013),(323,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"Freezer\", \"Brand\": \"Condura\", \"Model\": \"DT42930SMD\", \"Wattage\": \"2000-4000\"}',65000,2013),(324,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"Freezer\", \"Brand\": \"Panasonic\", \"Model\": \"LD03DID\", \"Wattage\": \"2000-4000\"}',15000,2013),(325,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"2in1\", \"Brand\": \"Condura\", \"Model\": \"MDO300AA\", \"Wattage\": \"2000-4000\"}',35000,2013),(326,'Appliances','{\"Item\": \"Refrigirator\", \"Type\": \"2in1\", \"Brand\": \"Panasonic\", \"Model\": \"LD95JD3O\", \"Wattage\": \"2000-4000\"}',65000,2013),(327,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Jansport\", \"Model\": \"Digibreak Backpack\", \"Material\": \"Polyester\"}',3500,2013),(328,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Jansport\", \"Model\": \"Digibreak Expressions Backpack\", \"Material\": \"Fabric\"}',2500,2013),(329,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Jansport\", \"Model\": \"Digibreak Exclusive Backpack\", \"Material\": \"Leather\"}',6500,2013),(330,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Hawk\", \"Model\": \"8492 - BP\", \"Material\": \"Leather\"}',2000,2013),(331,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Hawk\", \"Model\": \"7563 - BP\", \"Material\": \"Polyester\"}',6500,2013),(332,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Hawk\", \"Model\": \"0294 - BP\", \"Material\": \"Fabric\"}',1500,2013),(333,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Jansport\", \"Model\": \"Digibreak Laptop Backpack\", \"Material\": \"Polyester\"}',2500,2013),(334,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Jansport\", \"Model\": \"Super FX Expressions Backpack\", \"Material\": \"Fabric\"}',6500,2013),(335,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Jansport\", \"Model\": \"Super FX Backpack\", \"Material\": \"Leather\"}',5000,2013),(336,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Hawk\", \"Model\": \"2641 - BP\", \"Material\": \"Leather\"}',6000,2013),(337,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Hawk\", \"Model\": \"3579 - BP\", \"Material\": \"Polyester\"}',1500,2013),(338,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Hawk\", \"Model\": \"1453 - BP\", \"Material\": \"Fabric\"}',6500,2013),(339,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Jansport\", \"Model\": \"Wanderer Pack Backpack\", \"Material\": \"Polyester\"}',4200,2015),(340,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Jansport\", \"Model\": \"Wanderer Expressions Backpack\", \"Material\": \"Fabric\"}',2500,2015),(341,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Jansport\", \"Model\": \"Right Warm Backpack\", \"Material\": \"Leather\"}',3000,2015),(342,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Hawk\", \"Model\": \"5254 - BP\", \"Material\": \"Leather\"}',1660,2015),(343,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Hawk\", \"Model\": \"9503 - BP\", \"Material\": \"Polyester\"}',1550,2015),(344,'Bags','{\"Item\": \"BackPack\", \"Brand\": \"Hawk\", \"Model\": \"9910 - BP\", \"Material\": \"Fabric\"}',2000,2015),(345,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Gucci\", \"Model\": \"KD93KDSL\", \"Material\": \"Leather\"}',65000,2015),(346,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Gucci\", \"Model\": \"VM93KDL4\", \"Material\": \"Synthetic Leather\"}',45000,2015),(347,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Coach\", \"Model\": \"XM40SLM3\", \"Material\": \"Leather\"}',6850,2015),(348,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Coach\", \"Model\": \"94PSKMS\", \"Material\": \"Synthetic Leather\"}',8500,2015),(349,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Anello\", \"Model\": \"E940DPD\", \"Material\": \"Leather\"}',45660,2015),(350,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Anello\", \"Model\": \"ALBJ94L\", \"Material\": \"Synthetic Leather\"}',15000,2015),(351,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Gucci\", \"Model\": \"LG94DKD\", \"Material\": \"Leather\"}',38000,2015),(352,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Gucci\", \"Model\": \"04LDO3KS\", \"Material\": \"Synthetic Leather\"}',65000,2015),(353,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Coach\", \"Model\": \"KD9K3MDL\", \"Material\": \"Leather\"}',7500,2015),(354,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Coach\", \"Model\": \"NDI3LD0\", \"Material\": \"Synthetic Leather\"}',6000,2015),(355,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Anello\", \"Model\": \"MV93DS4D\", \"Material\": \"Leather\"}',2500,2015),(356,'Bags','{\"Item\": \"Shoulder Bag\", \"Brand\": \"Anello\", \"Model\": \"MV93MDLS\", \"Material\": \"Synthetic Leather\"}',1600,2015),(357,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Nike\", \"Model\": \"DK30KD94\", \"Material\": \"Polyester\"}',1700,2015),(358,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Nike\", \"Model\": \"NG8G4KDSD\", \"Material\": \"Fabric\"}',1600,2015),(359,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Nike\", \"Model\": \"94KDKSL4S\", \"Material\": \"Polyester\"}',1600,2015),(360,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Adidas\", \"Model\": \"MV4LD034\", \"Material\": \"Fabric\"}',1200,2015),(361,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Adidas\", \"Model\": \"DKORLS94\", \"Material\": \"Polyester\"}',3000,2015),(362,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Adidas\", \"Model\": \"MVE39FKL\", \"Material\": \"Fabric\"}',4500,2015),(363,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Nike\", \"Model\": \"MB93D9L3\", \"Material\": \"Polyester\"}',9500,2012),(364,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Nike\", \"Model\": \"MV93LD9B\", \"Material\": \"Fabric\"}',4500,2012),(365,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Nike\", \"Model\": \"MV489SDM3\", \"Material\": \"Polyester\"}',6000,2012),(366,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Adidas\", \"Model\": \"MC93KDS\", \"Material\": \"Fabric\"}',2500,2012),(367,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Adidas\", \"Model\": \"MV93LDDS\", \"Material\": \"Polyester\"}',5200,2012),(368,'Bags','{\"Item\": \"Duffle Bag\", \"Brand\": \"Adidas\", \"Model\": \"CI49WKS4\", \"Material\": \"Fabric\"}',2000,2012),(369,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"UnderArmour\", \"Model\": \"LBM940D\", \"Material\": \"Polyester\"}',9000,2012),(370,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"UnderArmour\", \"Model\": \"NB94OD03\", \"Material\": \"Fabric\"}',6000,2012),(371,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"UnderArmour\", \"Model\": \"S03EPS40\", \"Material\": \"Polyester\"}',4000,2012),(372,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"Converse\", \"Model\": \"7FDO30S\", \"Material\": \"Fabric\"}',6000,2012),(373,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"Converse\", \"Model\": \"4MC30KD\", \"Material\": \"Polyester\"}',4000,2012),(374,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"Converse\", \"Model\": \"MR30LD0\", \"Material\": \"Fabric\"}',4000,2012),(375,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"UnderArmour\", \"Model\": \"MV94D03\", \"Material\": \"Polyester\"}',6000,2012),(376,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"UnderArmour\", \"Model\": \"Z94KD03L\", \"Material\": \"Fabric\"}',7000,2012),(377,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"UnderArmour\", \"Model\": \"D03D0S34\", \"Material\": \"Polyester\"}',5000,2012),(378,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"Converse\", \"Model\": \"MD30LD93\", \"Material\": \"Fabric\"}',4000,2012),(379,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"Converse\", \"Model\": \"MD30DLSA\", \"Material\": \"Polyester\"}',3000,2012),(380,'Bags','{\"Item\": \"Sports Bag\", \"Brand\": \"Converse\", \"Model\": \"MTO4KSAS\", \"Material\": \"Fabric\"}',3300,2012),(381,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"Laptop\", \"Brand\": \"HP\", \"Model\": \"Spectre X360 - 15T\", \"Storage\": \"1 TB and above\", \"Processor\": \"i5 7th Gen\", \"Unit of Measure in Storage\": \"TB\"}',45000,2011),(382,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"Laptop\", \"Brand\": \"HP\", \"Model\": \"Spectre X360 - 15\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 8th Gen\", \"Unit of Measure in Storage\": \"GB\"}',16000,2011),(383,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"Laptop\", \"Brand\": \"HP\", \"Model\": \"Spectre X360 - 13T\", \"Storage\": \"0-500 GB\", \"Processor\": \"i7 6th Gen\", \"Unit of Measure in Storage\": \"GB\"}',35000,2011),(384,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"Laptop\", \"Brand\": \"Dell\", \"Model\": \"XPS 15 2in1\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 5th Gen\", \"Unit of Measure in Storage\": \"GB\"}',71000,2011),(385,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"Laptop\", \"Brand\": \"Dell\", \"Model\": \"XPS 17 2in1\", \"Storage\": \"1 TB and above\", \"Processor\": \"i3 6th Gen\", \"Unit of Measure in Storage\": \"TB\"}',68000,2011),(386,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"Laptop\", \"Brand\": \"Dell\", \"Model\": \"XPS 13 2in1\", \"Storage\": \"1 TB and above\", \"Processor\": \"i7 8th Gen\", \"Unit of Measure in Storage\": \"TB\"}',15000,2011),(387,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"Laptop\", \"Brand\": \"HP\", \"Model\": \"ENVY 15T\", \"Storage\": \"1 TB and above\", \"Processor\": \"i5 7th Gen\", \"Unit of Measure in Storage\": \"TB\"}',35000,2011),(388,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"Laptop\", \"Brand\": \"HP\", \"Model\": \"ENVY 15\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 8th Gen\", \"Unit of Measure in Storage\": \"GB\"}',65000,2011),(389,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"Laptop\", \"Brand\": \"HP\", \"Model\": \"ENVY 13\", \"Storage\": \"0-500 GB\", \"Processor\": \"i7 6th Gen\", \"Unit of Measure in Storage\": \"GB\"}',40000,2011),(390,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"Laptop\", \"Brand\": \"Dell\", \"Model\": \"G3\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 5th Gen\", \"Unit of Measure in Storage\": \"GB\"}',64000,2011),(391,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"Laptop\", \"Brand\": \"Dell\", \"Model\": \"G5\", \"Storage\": \"1 TB and above\", \"Processor\": \"i3 6th Gen\", \"Unit of Measure in Storage\": \"TB\"}',25000,2011),(392,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"Laptop\", \"Brand\": \"Dell\", \"Model\": \"G7\", \"Storage\": \"1 TB and above\", \"Processor\": \"i7 8th Gen\", \"Unit of Measure in Storage\": \"TB\"}',35000,2011),(393,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"ChromeBook\", \"Brand\": \"Asus\", \"Model\": \"Flip C302\", \"Storage\": \"1 TB and above\", \"Processor\": \"i7 7th Gen\", \"Unit of Measure in Storage\": \"GB\"}',17000,2017),(394,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"ChromeBook\", \"Brand\": \"Asus\", \"Model\": \"Flip C502\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 6th Gen\", \"Unit of Measure in Storage\": \"GB\"}',15000,2017),(395,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"ChromeBook\", \"Brand\": \"Asus\", \"Model\": \"Flip C702\", \"Storage\": \"0-500 GB\", \"Processor\": \"i5 7th Gen\", \"Unit of Measure in Storage\": \"GB\"}',16000,2017),(396,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"ChromeBook\", \"Brand\": \"Acer\", \"Model\": \"N50Ti\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 8th Gen\", \"Unit of Measure in Storage\": \"GB\"}',14000,2017),(397,'Computer Machine','{\"Ram\": \"16\", \"Item\": \"ChromeBook\", \"Brand\": \"Acer\", \"Model\": \"N50Ti\", \"Storage\": \"1 TB and above\", \"Processor\": \"i7 8th Gen\", \"Unit of Measure in Storage\": \"GB\"}',16000,2017),(398,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"ChromeBook\", \"Brand\": \"Acer\", \"Model\": \"N50Ti\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 6th Gen\", \"Unit of Measure in Storage\": \"GB\"}',16000,2017),(399,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"ChromeBook\", \"Brand\": \"Asus\", \"Model\": \"Flip C101 PA\", \"Storage\": \"1 TB and above\", \"Processor\": \"i7 7th Gen\", \"Unit of Measure in Storage\": \"GB\"}',15000,2017),(400,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"ChromeBook\", \"Brand\": \"Asus\", \"Model\": \"Flip C101\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 6th Gen\", \"Unit of Measure in Storage\": \"GB\"}',17000,2017),(401,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"ChromeBook\", \"Brand\": \"Asus\", \"Model\": \"Flip C100 PA\", \"Storage\": \"0-500 GB\", \"Processor\": \"i5 7th Gen\", \"Unit of Measure in Storage\": \"GB\"}',15000,2017),(402,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"ChromeBook\", \"Brand\": \"Acer\", \"Model\": \"R11\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 8th Gen\", \"Unit of Measure in Storage\": \"GB\"}',15000,2017),(403,'Computer Machine','{\"Ram\": \"16\", \"Item\": \"ChromeBook\", \"Brand\": \"Acer\", \"Model\": \"Chromebook 14\", \"Storage\": \"1 TB and above\", \"Processor\": \"i7 8th Gen\", \"Unit of Measure in Storage\": \"GB\"}',6500,2017),(404,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"ChromeBook\", \"Brand\": \"Acer\", \"Model\": \"R13\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 6th Gen\", \"Unit of Measure in Storage\": \"GB\"}',9000,2017),(405,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"2in1 Laptop\", \"Brand\": \"Lenovo\", \"Model\": \"YT3-X50\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 5th Gen\", \"Unit of Measure in Storage\": \"GB\"}',25000,2017),(406,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"2in1 Laptop\", \"Brand\": \"Lenovo\", \"Model\": \"Yoga 900\", \"Storage\": \"1 TB and above\", \"Processor\": \"i3 6th Gen\", \"Unit of Measure in Storage\": \"TB\"}',65000,2017),(407,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"2in1 Laptop\", \"Brand\": \"Lenovo\", \"Model\": \"Yoga 700\", \"Storage\": \"0-500 GB\", \"Processor\": \"i5 7th Gen\", \"Unit of Measure in Storage\": \"GB\"}',80000,2017),(408,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"2in1 Laptop\", \"Brand\": \"Acer\", \"Model\": \"SP111-31N\", \"Storage\": \"0-500 GB\", \"Processor\": \"intel 3rd Gen\", \"Unit of Measure in Storage\": \"GB\"}',16400,2017),(409,'Computer Machine','{\"Ram\": \"2\", \"Item\": \"2in1 Laptop\", \"Brand\": \"Acer\", \"Model\": \"SP111-31N-P5C9\", \"Storage\": \"0-500 GB\", \"Processor\": \"intel 4th Gen\", \"Unit of Measure in Storage\": \"GB\"}',68000,2017),(410,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"2in1 Laptop\", \"Brand\": \"Acer\", \"Model\": \"SP111-31N-P2GH\", \"Storage\": \"1 TB and above\", \"Processor\": \"intel 4th Gen\", \"Unit of Measure in Storage\": \"TB\"}',65000,2017),(411,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"2in1 Laptop\", \"Brand\": \"Lenovo\", \"Model\": \"L380\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 5th Gen\", \"Unit of Measure in Storage\": \"GB\"}',35200,2017),(412,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"2in1 Laptop\", \"Brand\": \"Lenovo\", \"Model\": \"Yoga - 720\", \"Storage\": \"1 TB and above\", \"Processor\": \"i3 6th Gen\", \"Unit of Measure in Storage\": \"TB\"}',45000,2017),(413,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"2in1 Laptop\", \"Brand\": \"Lenovo\", \"Model\": \"Yoga - 730\", \"Storage\": \"0-500 GB\", \"Processor\": \"i5 7th Gen\", \"Unit of Measure in Storage\": \"GB\"}',33300,2018),(414,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"2in1 Laptop\", \"Brand\": \"Acer\", \"Model\": \"SP111-R75IT1\", \"Storage\": \"0-500 GB\", \"Processor\": \"intel 3rd Gen\", \"Unit of Measure in Storage\": \"GB\"}',35500,2018),(415,'Computer Machine','{\"Ram\": \"2\", \"Item\": \"2in1 Laptop\", \"Brand\": \"Acer\", \"Model\": \"SP111-32N-P4C0\", \"Storage\": \"0-500 GB\", \"Processor\": \"intel 4th Gen\", \"Unit of Measure in Storage\": \"GB\"}',35400,2018),(416,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"2in1 Laptop\", \"Brand\": \"Acer\", \"Model\": \"SP111-32N-P0FA\", \"Storage\": \"1 TB and above\", \"Processor\": \"intel 4th Gen\", \"Unit of Measure in Storage\": \"TB\"}',67620,2018),(417,'Computer Machine','{\"Ram\": \"16\", \"Item\": \"System Unit\", \"Brand\": \"Dell\", \"Model\": \"MF83KDL51\", \"Storage\": \"1 TB and above\", \"Processor\": \"i7 8th Gen\", \"Unit of Measure in Storage\": \"TB\"}',67300,2018),(418,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"System Unit\", \"Brand\": \"Dell\", \"Model\": \"MD03LD089\", \"Storage\": \"1 TB and above\", \"Processor\": \"i5 4th Gen\", \"Unit of Measure in Storage\": \"TB\"}',78200,2018),(419,'Computer Machine','{\"Ram\": \"32\", \"Item\": \"System Unit\", \"Brand\": \"Dell\", \"Model\": \"MCO2NSEL\", \"Storage\": \"1 TB and above\", \"Processor\": \"i9 7th Gen\", \"Unit of Measure in Storage\": \"TB\"}',35650,2018),(420,'Computer Machine','{\"Ram\": \"32 or above\", \"Item\": \"System Unit\", \"Brand\": \"HP\", \"Model\": \"D93KD04\", \"Storage\": \"1 TB and above\", \"Processor\": \"Core2Duo\", \"Unit of Measure in Storage\": \"TB\"}',98550,2018),(421,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"System Unit\", \"Brand\": \"HP\", \"Model\": \"MD93LSD4\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 7th Gen\", \"Unit of Measure in Storage\": \"GB\"}',98500,2018),(422,'Computer Machine','{\"Ram\": \"32 or above\", \"Item\": \"System Unit\", \"Brand\": \"HP\", \"Model\": \"MD39LSA\", \"Storage\": \"0-500 GB\", \"Processor\": \"Core2Duo\", \"Unit of Measure in Storage\": \"GB\"}',86220,2018),(423,'Computer Machine','{\"Ram\": \"16\", \"Item\": \"System Unit\", \"Brand\": \"Dell\", \"Model\": \"D03LS4A\", \"Storage\": \"1 TB and above\", \"Processor\": \"i7 8th Gen\", \"Unit of Measure in Storage\": \"TB\"}',84000,2016),(424,'Computer Machine','{\"Ram\": \"4\", \"Item\": \"System Unit\", \"Brand\": \"Dell\", \"Model\": \"MC943LS\", \"Storage\": \"1 TB and above\", \"Processor\": \"i5 4th Gen\", \"Unit of Measure in Storage\": \"TB\"}',75000,2016),(425,'Computer Machine','{\"Ram\": \"32 or above\", \"Item\": \"System Unit\", \"Brand\": \"Dell\", \"Model\": \"NC93KDS\", \"Storage\": \"1 TB and above\", \"Processor\": \"i9 7th Gen\", \"Unit of Measure in Storage\": \"TB\"}',65000,2016),(426,'Computer Machine','{\"Ram\": \"32 or above\", \"Item\": \"System Unit\", \"Brand\": \"HP\", \"Model\": \"KR93KSLE\", \"Storage\": \"1 TB and above\", \"Processor\": \"Core2Duo\", \"Unit of Measure in Storage\": \"TB\"}',35000,2016),(427,'Computer Machine','{\"Ram\": \"8\", \"Item\": \"System Unit\", \"Brand\": \"HP\", \"Model\": \"MR93D03A\", \"Storage\": \"0-500 GB\", \"Processor\": \"i3 7th Gen\", \"Unit of Measure in Storage\": \"GB\"}',25000,2016),(428,'Computer Machine','{\"Ram\": \"32 or above\", \"Item\": \"System Unit\", \"Brand\": \"HP\", \"Model\": \"JF94LDLP3\", \"Storage\": \"0-500 GB\", \"Processor\": \"Core2Duo\", \"Unit of Measure in Storage\": \"GB\"}',25000,2016),(429,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Logitech\", \"Model\": \"G305\"}',9000,2016),(430,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Logitech\", \"Model\": \"G603\"}',1500,2016),(431,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Logitech\", \"Model\": \"G300S\"}',3450,2016),(432,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Razer\", \"Model\": \"DeathAdder Elite\"}',9500,2016),(433,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Razer\", \"Model\": \"DeathAdder\"}',9000,2016),(434,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Razer\", \"Model\": \"Naga Hex V2\"}',9000,2016),(435,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Logitech\", \"Model\": \"G302\"}',1500,2016),(436,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Logitech\", \"Model\": \"G602\"}',5000,2016),(437,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Logitech\", \"Model\": \"G600\"}',500,2016),(438,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Razer\", \"Model\": \"Abyssus Essential\"}',10000,2016),(439,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Razer\", \"Model\": \"Abyssus V2\"}',8000,2016),(440,'Generic Gadget','{\"Item\": \"Gaming Mouse\", \"Brand\": \"Razer\", \"Model\": \"Mamba Tournament Edition\"}',8000,2016),(441,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"Dell\", \"Model\": \"WM527\"}',900,2016),(442,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"Dell\", \"Model\": \"WM615\"}',800,2016),(443,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"Dell\", \"Model\": \"WM126\"}',900,2016),(444,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"HP\", \"Model\": \"X3000\"}',1750,2016),(445,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"HP\", \"Model\": \"Z3700\"}',750,2016),(446,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"HP\", \"Model\": \"H2L63UT\"}',1570,2016),(447,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"Dell\", \"Model\": \"AW958\"}',1500,2016),(448,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"Dell\", \"Model\": \"WM514\"}',1500,2016),(449,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"Dell\", \"Model\": \"WM326\"}',500,2016),(450,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"HP\", \"Model\": \"H4B81AA\"}',350,2016),(451,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"HP\", \"Model\": \"Z5000\"}',2500,2016),(452,'Generic Gadget','{\"Item\": \"Office Mouse\", \"Brand\": \"HP\", \"Model\": \"1AM58AA#ABL\"}',300,2016),(453,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Razer\", \"Model\": \"BlackWidow X Chroma Gunmetal\"}',10000,2016),(454,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Razer\", \"Model\": \"BlackWidow Tournament Edition Chroma V2\"}',9000,2016),(455,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Razer\", \"Model\": \"BlackWidow Ultimate\"}',6500,2016),(456,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"G513\"}',4000,2016),(457,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"G613\"}',3500,2016),(458,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"G910\"}',5000,2016),(459,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Razer\", \"Model\": \"Ornata\"}',18000,2016),(460,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Razer\", \"Model\": \"Cysona Chroma\"}',9000,2016),(461,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Razer\", \"Model\": \"Orbweaber\"}',9000,2016),(462,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"G610\"}',3500,2016),(463,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"G413\"}',4500,2016),(464,'Generic Gadget','{\"Item\": \"Gaming Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"G213\"}',4500,2016),(465,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"Craft\"}',4500,2016),(466,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"K830\"}',3500,2016),(467,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"K811\"}',2500,2016),(468,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Dell\", \"Model\": \"MK520\"}',1000,2016),(469,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Dell\", \"Model\": \"KM636\"}',2000,2016),(470,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Dell\", \"Model\": \"KM714\"}',6000,2016),(471,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"K800\"}',5000,2016),(472,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"K840 Mechanical\"}',9000,2018),(473,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Logitech\", \"Model\": \"K810\"}',1500,2018),(474,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Dell\", \"Model\": \"KM717\"}',1500,2018),(475,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Dell\", \"Model\": \"MK850\"}',1000,2018),(476,'Generic Gadget','{\"Item\": \"Office Keyboard\", \"Brand\": \"Dell\", \"Model\": \"KM636\"}',3000,2018),(477,'Generic Gadget','{\"Item\": \"Controller\", \"Brand\": \"Logitech\", \"Model\": \"F710\"}',2000,2018),(478,'Generic Gadget','{\"Item\": \"Controller\", \"Brand\": \"Logitech\", \"Model\": \"F310\"}',1200,2018),(479,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Apple\", \"Model\": \"iPhone 3\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',45000,2018),(480,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Apple\", \"Model\": \"iPhone 3GS\", \"Storage\": \"64\", \"Unit of Measure in Storage\": \"GB\"}',60000,2018),(481,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Apple\", \"Model\": \"iPhone 4S\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',35000,2018),(482,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Samsung\", \"Model\": \"Galaxy Note\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',30000,2018),(483,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Samsung\", \"Model\": \"Galaxy Note II\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',20000,2018),(484,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Samsung\", \"Model\": \"Galaxy Note 3\", \"Storage\": \"64\", \"Unit of Measure in Storage\": \"GB\"}',15000,2018),(485,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Apple\", \"Model\": \"iPhone 4 Plus\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',64000,2018),(486,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Apple\", \"Model\": \"iPhone 7 Plus\", \"Storage\": \"64\", \"Unit of Measure in Storage\": \"GB\"}',35000,2018),(487,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Apple\", \"Model\": \"iPhone 7\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',15000,2018),(488,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Samsung\", \"Model\": \"Galaxy Note 4\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',7000,2018),(489,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Samsung\", \"Model\": \"Galaxy Note 5\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',5000,2018),(490,'Mobile','{\"Item\": \"Smart Phone\", \"Brand\": \"Samsung\", \"Model\": \"Galaxy Note 6\", \"Storage\": \"64\", \"Unit of Measure in Storage\": \"GB\"}',8600,2018),(491,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Samsung\", \"Model\": \"Galaxy Tab\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',7900,2018),(492,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Samsung\", \"Model\": \"Galaxy Tab 2\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',8800,2018),(493,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Samsung\", \"Model\": \"Galaxy Tab 3\", \"Storage\": \"64\", \"Unit of Measure in Storage\": \"GB\"}',9000,2018),(494,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Lenovo\", \"Model\": \"Lenovo Tab 4\", \"Storage\": \"2\", \"Unit of Measure in Storage\": \"GB\"}',5000,2018),(495,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Lenovo\", \"Model\": \"Lenovo Tab\", \"Storage\": \"8\", \"Unit of Measure in Storage\": \"GB\"}',8000,2017),(496,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Lenovo\", \"Model\": \"Lenovo Tab 2\", \"Storage\": \"4\", \"Unit of Measure in Storage\": \"GB\"}',9000,2017),(497,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Samsung\", \"Model\": \"Galaxy Tab 3 Lite\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',5000,2017),(498,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Samsung\", \"Model\": \"Galaxy Tab 4\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',9000,2017),(499,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Samsung\", \"Model\": \"Galaxy Tab Pro\", \"Storage\": \"64\", \"Unit of Measure in Storage\": \"GB\"}',8000,2016),(500,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Lenovo\", \"Model\": \"Lenovo Tab 3\", \"Storage\": \"2\", \"Unit of Measure in Storage\": \"GB\"}',8000,2016),(501,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Lenovo\", \"Model\": \"Lenovo P8\", \"Storage\": \"8\", \"Unit of Measure in Storage\": \"GB\"}',17000,2016),(502,'Mobile','{\"Item\": \"Tablet\", \"Brand\": \"Lenovo\", \"Model\": \"Lenovo Tab 7\", \"Storage\": \"4\", \"Unit of Measure in Storage\": \"GB\"}',16000,2017),(503,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"MyPhone\", \"Model\": \"MyPhone 11s\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',15000,2017),(504,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"MyPhone\", \"Model\": \"MyPhone 10s\", \"Storage\": \"16\", \"Unit of Measure in Storage\": \"GB\"}',8000,2017),(505,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"MyPhone\", \"Model\": \"MyPhone 9s\", \"Storage\": \"4\", \"Unit of Measure in Storage\": \"GB\"}',5500,2017),(506,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"Cheryy Mobile\", \"Model\": \"Cheryy Mobile 320\", \"Storage\": \"2\", \"Unit of Measure in Storage\": \"GB\"}',4400,2017),(507,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"Cheryy Mobile\", \"Model\": \"Cheryy Mobile 310\", \"Storage\": \"8\", \"Unit of Measure in Storage\": \"GB\"}',8800,2017),(508,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"Cheryy Mobile\", \"Model\": \"Cheryy Mobile 330\", \"Storage\": \"4\", \"Unit of Measure in Storage\": \"GB\"}',9000,2017),(509,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"MyPhone\", \"Model\": \"MyPhone 11s\", \"Storage\": \"32\", \"Unit of Measure in Storage\": \"GB\"}',8000,2017),(510,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"MyPhone\", \"Model\": \"MyPhone 10s\", \"Storage\": \"16\", \"Unit of Measure in Storage\": \"GB\"}',7000,2017),(511,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"MyPhone\", \"Model\": \"MyPhone 9s\", \"Storage\": \"4\", \"Unit of Measure in Storage\": \"GB\"}',6000,2017),(512,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"Cheryy Mobile\", \"Model\": \"Cheryy Mobile 320\", \"Storage\": \"2\", \"Unit of Measure in Storage\": \"GB\"}',4000,2017),(513,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"Cheryy Mobile\", \"Model\": \"Cheryy Mobile 310\", \"Storage\": \"8\", \"Unit of Measure in Storage\": \"GB\"}',9000,2017),(514,'Mobile','{\"Item\": \"Phablet\", \"Brand\": \"Cheryy Mobile\", \"Model\": \"Cheryy Mobile 330\", \"Storage\": \"4\", \"Unit of Measure in Storage\": \"GB\"}',7000,2017),(515,'Television','{\"Item\": \"Smart TV\", \"Type\": \"LED\", \"Brand\": \"LG\", \"Model\": \"D93KDL3O\", \"Resolution\": \"1080P\", \"Screensize\": \"70-79\"}',60000,2017),(516,'Television','{\"Item\": \"Smart TV\", \"Type\": \"LCD\", \"Brand\": \"Samsung\", \"Model\": \"93KD03J5NS\", \"Resolution\": \"Nano Crystal\", \"Screensize\": \"80 and above\"}',70000,2017),(517,'Television','{\"Item\": \"Smart TV\", \"Type\": \"OLED\", \"Brand\": \"LG\", \"Model\": \"94KLSSJD9E\", \"Resolution\": \"720P\", \"Screensize\": \"60-69\"}',30000,2017),(518,'Television','{\"Item\": \"Flat Screen\", \"Type\": \"LED\", \"Brand\": \"Samsung\", \"Model\": \"12LSIR3WA1\", \"Resolution\": \"4K\", \"Screensize\": \"50-59\"}',50000,2017),(519,'Television','{\"Item\": \"Flat Screen\", \"Type\": \"LCD\", \"Brand\": \"LG\", \"Model\": \"MO304KDN4\", \"Resolution\": \"1080P\", \"Screensize\": \"70-79\"}',50000,2017),(520,'Television','{\"Item\": \"Flat Screen\", \"Type\": \"OLED\", \"Brand\": \"Samsung\", \"Model\": \"93KD3L4JD\", \"Resolution\": \"Nano Crystal\", \"Screensize\": \"80 and above\"}',50000,2017),(521,'Television','{\"Item\": \"Smart TV\", \"Type\": \"OLED\", \"Brand\": \"LG\", \"Model\": \"MO35JFN3\", \"Resolution\": \"720P\", \"Screensize\": \"80 and above\"}',40000,2017),(522,'Television','{\"Item\": \"Flat Screen\", \"Type\": \"LED\", \"Brand\": \"Samsung\", \"Model\": \"I3DJ93DKS\", \"Resolution\": \"4K\", \"Screensize\": \"40-49\"}',30000,2017),(523,'Television','{\"Item\": \"Smart TV\", \"Type\": \"LED\", \"Brand\": \"LG\", \"Model\": \"M30SKDP3D\", \"Resolution\": \"1080P\", \"Screensize\": \"70-79\"}',50000,2017),(524,'Television','{\"Item\": \"Smart TV\", \"Type\": \"LCD\", \"Brand\": \"Samsung\", \"Model\": \"J39LS03J\", \"Resolution\": \"Nano Crystal\", \"Screensize\": \"80 and above\"}',50000,2017),(525,'Television','{\"Item\": \"Smart TV\", \"Type\": \"OLED\", \"Brand\": \"LG\", \"Model\": \"93LDSO40SJ\", \"Resolution\": \"720P\", \"Screensize\": \"60-79\"}',50000,2017),(526,'Television','{\"Item\": \"Flat Screen\", \"Type\": \"LED\", \"Brand\": \"Samsung\", \"Model\": \"6JS7SMSL3\", \"Resolution\": \"4K\", \"Screensize\": \"50-59\"}',50000,2014),(527,'Television','{\"Item\": \"Flat Screen\", \"Type\": \"LCD\", \"Brand\": \"LG\", \"Model\": \"40SM4LS8\", \"Resolution\": \"1080P\", \"Screensize\": \"39-49\"}',50000,2014),(528,'Television','{\"Item\": \"Flat Screen\", \"Type\": \"OLED\", \"Brand\": \"Samsung\", \"Model\": \"94KDLS94K\", \"Resolution\": \"Nano Crystal\", \"Screensize\": \"80 and above\"}',50000,2014),(529,'Television','{\"Item\": \"Smart TV\", \"Type\": \"OLED\", \"Brand\": \"LG\", \"Model\": \"94KSL49SJ\", \"Resolution\": \"720P\", \"Screensize\": \"80 and above\"}',50000,2014),(530,'Television','{\"Item\": \"Flat Screen\", \"Type\": \"LED\", \"Brand\": \"Samsung\", \"Model\": \"I4ISLFJR9FK\", \"Resolution\": \"4K\", \"Screensize\": \"38 and below\"}',50000,2014),(533,'Toys','{\"Item\": \"donn\", \"Brand\": \"salvador\"}',20000,2015);
/*!40000 ALTER TABLE `tbl_preset` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_pullout`
--

DROP TABLE IF EXISTS `tbl_pullout`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_pullout` (
  `intPulloutID` int(7) NOT NULL AUTO_INCREMENT,
  `datDatePulledOut` date NOT NULL,
  `intPulloutConsignorID` varchar(20) NOT NULL,
  `booStatus` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intPulloutID`),
  KEY `p to c_idx` (`intPulloutConsignorID`),
  CONSTRAINT `p to c` FOREIGN KEY (`intPulloutConsignorID`) REFERENCES `tbl_consignor` (`intConsignorID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_pullout`
--

LOCK TABLES `tbl_pullout` WRITE;
/*!40000 ALTER TABLE `tbl_pullout` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_pullout` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_pullout_items`
--

DROP TABLE IF EXISTS `tbl_pullout_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_pullout_items` (
  `intPulledoutItemsID` int(8) NOT NULL AUTO_INCREMENT,
  `intPIConsignmentItemsID` int(8) NOT NULL,
  `intPIPulloutID` int(7) NOT NULL,
  `intQty` int(4) NOT NULL,
  PRIMARY KEY (`intPulledoutItemsID`),
  KEY `pullout items to consignment items_idx` (`intPIConsignmentItemsID`),
  KEY `pullout items to pullout_idx` (`intPIPulloutID`),
  CONSTRAINT `pullout items to consignment items` FOREIGN KEY (`intPIConsignmentItemsID`) REFERENCES `tbl_consignment_item` (`intConsignmentItemID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `pullout items to pullout` FOREIGN KEY (`intPIPulloutID`) REFERENCES `tbl_pullout` (`intPulloutID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_pullout_items`
--

LOCK TABLES `tbl_pullout_items` WRITE;
/*!40000 ALTER TABLE `tbl_pullout_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_pullout_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_pullout_status_history`
--

DROP TABLE IF EXISTS `tbl_pullout_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_pullout_status_history` (
  `intPulloutStatusID` int(11) NOT NULL AUTO_INCREMENT,
  `datDateChange` date NOT NULL,
  `intStaffID` int(11) NOT NULL,
  `Comment` longtext,
  `booStatus` tinyint(4) NOT NULL,
  `intPSHPulloutID` int(8) NOT NULL,
  PRIMARY KEY (`intPulloutStatusID`),
  KEY `PSH to pullout_idx` (`intPSHPulloutID`),
  CONSTRAINT `PSH to pullout` FOREIGN KEY (`intPSHPulloutID`) REFERENCES `tbl_pullout` (`intPulloutID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_pullout_status_history`
--

LOCK TABLES `tbl_pullout_status_history` WRITE;
/*!40000 ALTER TABLE `tbl_pullout_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_pullout_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_reserved_price`
--

DROP TABLE IF EXISTS `tbl_reserved_price`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_reserved_price` (
  `intReservedPriceID` int(11) NOT NULL AUTO_INCREMENT,
  `intRPConsignmentItemID` int(10) NOT NULL,
  `dblReservePrice` double NOT NULL DEFAULT '100',
  PRIMARY KEY (`intReservedPriceID`),
  KEY `RP to ConsignITem` (`intRPConsignmentItemID`),
  CONSTRAINT `RP to ConsignITem` FOREIGN KEY (`intRPConsignmentItemID`) REFERENCES `tbl_consignment_item` (`intConsignmentItemID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_reserved_price`
--

LOCK TABLES `tbl_reserved_price` WRITE;
/*!40000 ALTER TABLE `tbl_reserved_price` DISABLE KEYS */;
INSERT INTO `tbl_reserved_price` VALUES (29,44,100),(30,45,100),(31,50,1100),(32,51,100),(33,53,100);
/*!40000 ALTER TABLE `tbl_reserved_price` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_sales_invoice`
--

DROP TABLE IF EXISTS `tbl_sales_invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_sales_invoice` (
  `intSalesInvoiceID` int(9) NOT NULL AUTO_INCREMENT,
  `datDate` date NOT NULL,
  `intReceiptBidderID` int(7) NOT NULL,
  `booSIStatus` tinyint(1) NOT NULL DEFAULT '0',
  `intSIAuctionID` int(11) NOT NULL,
  `strBankReference` varchar(45) DEFAULT NULL,
  `intOrderID` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`intSalesInvoiceID`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_sales_invoice`
--

LOCK TABLES `tbl_sales_invoice` WRITE;
/*!40000 ALTER TABLE `tbl_sales_invoice` DISABLE KEYS */;
INSERT INTO `tbl_sales_invoice` VALUES (16,'2018-10-19',77,3,13,'1213123','101920189203297059');
/*!40000 ALTER TABLE `tbl_sales_invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_sales_invoice_details`
--

DROP TABLE IF EXISTS `tbl_sales_invoice_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_sales_invoice_details` (
  `intSalesInvoiceDetailsID` int(8) NOT NULL AUTO_INCREMENT,
  `intSIDSalesInvoiceID` int(7) NOT NULL,
  `intRDBidlistID` int(11) DEFAULT NULL,
  `intComission` double DEFAULT NULL,
  `intPremium` double DEFAULT NULL,
  `intSIDQty` int(11) DEFAULT NULL,
  `dblSIDBidPrice` double DEFAULT NULL,
  `booSIDType` tinyint(4) DEFAULT NULL,
  `strAwardID` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`intSalesInvoiceDetailsID`),
  KEY `receipt details to bidlist_idx` (`intRDBidlistID`),
  KEY `SID to sales invoice_idx` (`intSIDSalesInvoiceID`),
  CONSTRAINT `SID to bidlist` FOREIGN KEY (`intRDBidlistID`) REFERENCES `tbl_bidlist` (`intBidlistID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `SID to sales invoice` FOREIGN KEY (`intSIDSalesInvoiceID`) REFERENCES `tbl_sales_invoice` (`intSalesInvoiceID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_sales_invoice_details`
--

LOCK TABLES `tbl_sales_invoice_details` WRITE;
/*!40000 ALTER TABLE `tbl_sales_invoice_details` DISABLE KEYS */;
INSERT INTO `tbl_sales_invoice_details` VALUES (13,16,76,375,500,1,2500,0,'I-000003');
/*!40000 ALTER TABLE `tbl_sales_invoice_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_si_status_history`
--

DROP TABLE IF EXISTS `tbl_si_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_si_status_history` (
  `intSIStatusID` int(11) NOT NULL AUTO_INCREMENT,
  `datDateChange` datetime NOT NULL,
  `intStaffID` int(11) DEFAULT NULL,
  `Comment` longtext,
  `booStatus` tinyint(4) NOT NULL,
  `intSISHSalesInvoice` int(9) NOT NULL,
  PRIMARY KEY (`intSIStatusID`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_si_status_history`
--

LOCK TABLES `tbl_si_status_history` WRITE;
/*!40000 ALTER TABLE `tbl_si_status_history` DISABLE KEYS */;
INSERT INTO `tbl_si_status_history` VALUES (60,'2018-10-19 00:02:44',NULL,'Your award has been shipped. Please expect a call from courier. Hello!',2,16),(61,'2018-10-19 00:03:30',NULL,'your award has been delivered. Thank you for bidding with Auction Pride of the Philippines! Bid again!',3,16);
/*!40000 ALTER TABLE `tbl_si_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_sold_official_receipt`
--

DROP TABLE IF EXISTS `tbl_sold_official_receipt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_sold_official_receipt` (
  `intSoldOfficialReceipt` int(9) NOT NULL,
  `intSORConsignmentItem` int(8) DEFAULT NULL,
  `intSORInvoiceID` int(9) DEFAULT NULL,
  PRIMARY KEY (`intSoldOfficialReceipt`),
  KEY `SOR to CID_idx` (`intSORConsignmentItem`),
  KEY `SOR to SI_idx` (`intSORInvoiceID`),
  CONSTRAINT `SOR to CID` FOREIGN KEY (`intSORConsignmentItem`) REFERENCES `tbl_consignment_item` (`intConsignmentItemID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `SOR to SI` FOREIGN KEY (`intSORInvoiceID`) REFERENCES `tbl_sales_invoice` (`intSalesInvoiceID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_sold_official_receipt`
--

LOCK TABLES `tbl_sold_official_receipt` WRITE;
/*!40000 ALTER TABLE `tbl_sold_official_receipt` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_sold_official_receipt` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_timeseries_category`
--

DROP TABLE IF EXISTS `tbl_timeseries_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_timeseries_category` (
  `intTSCId` int(11) NOT NULL AUTO_INCREMENT,
  `datTSCDate` date NOT NULL,
  `strTSCCategory` varchar(45) NOT NULL,
  `intTSCCount` int(11) DEFAULT NULL,
  PRIMARY KEY (`intTSCId`)
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_timeseries_category`
--

LOCK TABLES `tbl_timeseries_category` WRITE;
/*!40000 ALTER TABLE `tbl_timeseries_category` DISABLE KEYS */;
INSERT INTO `tbl_timeseries_category` VALUES (5,'2017-10-30','Appliances',21),(6,'2017-11-30','Appliances',13),(7,'2017-12-30','Appliances',17),(8,'2018-01-30','Appliances',12),(9,'2018-02-28','Appliances',27),(10,'2018-03-30','Appliances',36),(11,'2018-04-30','Appliances',13),(12,'2018-05-30','Appliances',9),(13,'2018-06-30','Appliances',12),(14,'2018-07-30','Appliances',0),(15,'2018-08-30','Appliances',12),(16,'2018-09-30','Appliances',11),(17,'2017-10-30','Bags',2),(18,'2017-11-30','Bags',13),(19,'2017-12-30','Bags',1),(20,'2018-01-30','Bags',2),(21,'2018-02-28','Bags',31),(22,'2018-03-30','Bags',71),(23,'2018-04-30','Bags',0),(24,'2018-05-30','Bags',1),(25,'2018-06-30','Bags',12),(26,'2018-07-30','Bags',14),(27,'2018-08-30','Bags',11),(28,'2018-09-30','Bags',11),(29,'2017-10-30','Furniture',12),(30,'2017-11-30','Furniture',13),(31,'2017-12-30','Furniture',9),(32,'2018-01-30','Furniture',21),(33,'2018-02-28','Furniture',11),(34,'2018-03-30','Furniture',11),(35,'2018-04-30','Furniture',13),(36,'2018-05-30','Furniture',13),(37,'2018-06-30','Furniture',3),(38,'2018-07-30','Furniture',4),(39,'2018-08-30','Furniture',1),(40,'2018-09-30','Furniture',6),(41,'2017-10-30','Camera',3),(42,'2017-11-30','Camera',1),(43,'2017-12-30','Camera',5),(44,'2018-01-30','Camera',6),(45,'2018-02-28','Camera',2),(46,'2018-03-30','Camera',14),(47,'2018-04-30','Camera',2),(48,'2018-05-30','Camera',2),(49,'2018-06-30','Camera',13),(50,'2018-07-30','Camera',12),(51,'2018-08-30','Camera',1),(52,'2018-09-30','Camera',0),(53,'2017-10-30','Mobile',102),(54,'2017-11-30','Mobile',21),(55,'2017-12-30','Mobile',31),(56,'2018-01-30','Mobile',91),(57,'2018-02-28','Mobile',12),(58,'2018-03-30','Mobile',14),(59,'2018-04-30','Mobile',2),(60,'2018-05-30','Mobile',4),(61,'2018-06-30','Mobile',12),(62,'2018-07-30','Mobile',42),(63,'2018-08-30','Mobile',13),(64,'2018-09-30','Mobile',21),(65,'2017-10-30','Shoes',23),(66,'2017-11-30','Shoes',2),(67,'2017-12-30','Shoes',33),(68,'2018-01-30','Shoes',2),(69,'2018-02-28','Shoes',14),(70,'2018-03-30','Shoes',1),(71,'2018-04-30','Shoes',2),(72,'2018-05-30','Shoes',4),(73,'2018-06-30','Shoes',1),(74,'2018-07-30','Shoes',4),(75,'2018-08-30','Shoes',1),(76,'2018-09-30','Shoes',2),(77,'2017-10-30','Computer Machine',12),(78,'2017-11-30','Computer Machine',2),(79,'2017-12-30','Computer Machine',3),(80,'2018-01-30','Computer Machine',2),(81,'2018-02-28','Computer Machine',1),(82,'2018-03-30','Computer Machine',1),(83,'2018-04-30','Computer Machine',2),(84,'2018-05-30','Computer Machine',4),(85,'2018-06-30','Computer Machine',1),(86,'2018-07-30','Computer Machine',4),(87,'2018-08-30','Computer Machine',1),(88,'2018-09-30','Computer Machine',2),(89,'2017-10-30','Toys',14),(90,'2017-11-30','Toys',12),(91,'2017-12-30','Toys',21),(92,'2018-01-30','Toys',12),(93,'2018-02-28','Toys',56),(94,'2018-03-30','Toys',14),(95,'2018-04-30','Toys',27),(96,'2018-05-30','Toys',34),(97,'2018-06-30','Toys',16),(98,'2018-07-30','Toys',44),(99,'2018-08-30','Toys',17),(100,'2018-09-30','Toys',23),(101,'2017-10-30','Television',12),(102,'2017-11-30','Television',11),(103,'2017-12-30','Television',21),(104,'2018-01-30','Television',11),(105,'2018-02-28','Television',51),(106,'2018-03-30','Television',13),(107,'2018-04-30','Television',47),(108,'2018-05-30','Television',54),(109,'2018-06-30','Television',16),(110,'2018-07-30','Television',44),(111,'2018-08-30','Television',7),(112,'2018-09-30','Television',3),(113,'2017-10-30','Generic Gadget',12),(114,'2017-11-30','Generic Gadget',11),(115,'2017-12-30','Generic Gadget',1),(116,'2018-01-30','Generic Gadget',12),(117,'2018-02-28','Generic Gadget',12),(118,'2018-03-30','Generic Gadget',3),(119,'2018-04-30','Generic Gadget',12),(120,'2018-05-30','Generic Gadget',2),(121,'2018-06-30','Generic Gadget',1),(122,'2018-07-30','Generic Gadget',31),(123,'2018-08-30','Generic Gadget',12),(124,'2018-09-30','Generic Gadget',31);
/*!40000 ALTER TABLE `tbl_timeseries_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_unit_of_measurement`
--

DROP TABLE IF EXISTS `tbl_unit_of_measurement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_unit_of_measurement` (
  `intUOMID` int(11) NOT NULL AUTO_INCREMENT,
  `strUOMDesc` varchar(45) NOT NULL,
  `booStatus` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`intUOMID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_unit_of_measurement`
--

LOCK TABLES `tbl_unit_of_measurement` WRITE;
/*!40000 ALTER TABLE `tbl_unit_of_measurement` DISABLE KEYS */;
INSERT INTO `tbl_unit_of_measurement` VALUES (5,'Unit',0),(6,'Box',0),(7,'Pack',0),(8,'Piece',0);
/*!40000 ALTER TABLE `tbl_unit_of_measurement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_utilities`
--

DROP TABLE IF EXISTS `tbl_utilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_utilities` (
  `intUtilitiesID` int(2) NOT NULL AUTO_INCREMENT,
  `dblBuyersPremium` double DEFAULT NULL,
  `intPaymentDays` int(2) DEFAULT NULL,
  `intStorageDays` int(2) DEFAULT NULL,
  `jsonDefaultLiveAuctionDuration` json DEFAULT NULL,
  `intMinimumDaysForAuction` int(11) DEFAULT NULL,
  `intMaximumDaysForAuction` int(11) DEFAULT NULL,
  `intMaximumItemsInCatalog` int(11) DEFAULT NULL,
  `intMinimumItemsInCatalog` int(11) DEFAULT NULL,
  `strLiveAuctionStartTime` varchar(5) DEFAULT NULL,
  `intAuctionGracePeriod` int(11) DEFAULT NULL,
  `intAuctionMonthLimit` int(11) DEFAULT NULL,
  `intExcellent` int(11) DEFAULT NULL,
  `intGood` int(11) DEFAULT NULL,
  `intOkay` int(11) DEFAULT NULL,
  `intBad` int(11) DEFAULT NULL,
  `dblSalvagePrice` double DEFAULT NULL,
  `doubleCommission` double DEFAULT '0.15',
  `intTimesInAuctionMax` int(11) DEFAULT '3',
  `intRegFee` int(11) DEFAULT '3000',
  `strCompanyName` varchar(200) DEFAULT NULL,
  `strAccountNumber` varchar(100) DEFAULT NULL,
  `jsonCompanyAddress` json DEFAULT NULL,
  PRIMARY KEY (`intUtilitiesID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_utilities`
--

LOCK TABLES `tbl_utilities` WRITE;
/*!40000 ALTER TABLE `tbl_utilities` DISABLE KEYS */;
INSERT INTO `tbl_utilities` VALUES (1,0.2,3,1,'{\"hours\": \"7\", \"minutes\": \"30\"}',1,4,10,1,'7:30',1,1,0,20,30,40,0.12,0.15,3,3000,'APPTRADE','937123781','{\"city\": \"Mandaluyong\", \"address\": \"Lot 21 Block 13\", \"baranggay\": \"Brgy. Pasig\"}');
/*!40000 ALTER TABLE `tbl_utilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'apptradev7'
--

--
-- Dumping routines for database 'apptradev7'
--
/*!50003 DROP FUNCTION IF EXISTS `smartcounter` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `smartcounter`() RETURNS int(11)
BEGIN
declare intcount int;
	Select Count(*) into intcount from tbl_consignor;
    return intcount;
RETURN 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `smartcounter_bundle` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `smartcounter_bundle`() RETURNS int(11)
BEGIN
declare intcount int;
	Select Count(*) into intcount from tbl_bundle;
    return intcount;
RETURN 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `smartcounter_item` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `smartcounter_item`() RETURNS int(11)
BEGIN
declare intcount int;
	Select Count(*) into intcount from tbl_consignment_item;
    return intcount;
RETURN 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-10-30 19:09:21
