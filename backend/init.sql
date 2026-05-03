SET NAMES 'utf8' COLLATE 'utf8_general_ci';
CREATE DATABASE IF NOT EXISTS perecanuel_db;

USE perecanuel_db;

-- ============================================================================
-- UNITÉS DE MESURE (kg, g, L, mL, unité, etc. avec possibilité de conversion)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `UnitesMesure` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(10) NOT NULL,
    `nom` VARCHAR(50)  NOT NULL,
    `facteur_conversion` FLOAT NOT NULL DEFAULT 1.0,
    `unite_base_id` INTEGER NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_unite_code` (`code`),
    CONSTRAINT `fk_unite_base`
        FOREIGN KEY (`unite_base_id`) REFERENCES `UnitesMesure`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================================
-- PRODUITS BRUTS
-- ============================================================
CREATE TABLE IF NOT EXISTS `RawProducts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,
    `stock_quantity` INTEGER NOT NULL DEFAULT 0,
    `unite_id` INTEGER NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_rawprod_unite`
        FOREIGN KEY (`unite_id`) REFERENCES `UnitesMesure`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- FOURNISSEURS
-- ============================================================
CREATE TABLE IF NOT EXISTS `Suppliers` (
    `id`                INTEGER      NOT NULL AUTO_INCREMENT,
    `name`              VARCHAR(100) NOT NULL,
    `tel`               VARCHAR(20)  NOT NULL,
    `email`             VARCHAR(150) NOT NULL,
    `web_site`          VARCHAR(200) NOT NULL,
    `person_to_contact` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_supplier_email` (`email`)
);

-- ============================================================
-- ASSOCIATION PRODUITS BRUTS <-> FOURNISSEURS 
-- ============================================================
CREATE TABLE IF NOT EXISTS `RawProductsSuppliers` (
    `supplier_id` INTEGER NOT NULL,
    `rawproduct_id` INTEGER NOT NULL,
    PRIMARY KEY (`supplier_id`, `rawproduct_id`),
    CONSTRAINT `fk_rps_supplier`
        FOREIGN KEY (`supplier_id`) REFERENCES `Suppliers`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_rps_rawprod`
        FOREIGN KEY (`rawproduct_id`) REFERENCES `RawProducts`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =====================================
-- PALIERS DE PRIX PAR QUANTITÉ 
-- =====================================
CREATE TABLE IF NOT EXISTS `PrixFournisseurQuantite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplier_id` INTEGER NOT NULL,
    `rawproduct_id` INTEGER NOT NULL,
    `quantite_min` INTEGER NOT NULL,
    `prix_unitaire` FLOAT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_prix_palier` (`supplier_id`, `rawproduct_id`, `quantite_min`),
    CONSTRAINT `fk_prix_rps`
        FOREIGN KEY (`supplier_id`, `rawproduct_id`)
        REFERENCES `RawProductsSuppliers`(`supplier_id`, `rawproduct_id`)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- COMMANDES DE PRODUITS BRUTS
-- ============================================================
CREATE TABLE IF NOT EXISTS `CommandesProduitBrut` (
    `id` INTEGER  NOT NULL AUTO_INCREMENT,
    `commande_id` INTEGER NULL,
    `id_produit` INTEGER  NOT NULL,
    `id_fournisseur` INTEGER NOT NULL,
    `unite_price` FLOAT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `receive_at` DATE NULL,
    `status`  ENUM('commander','expedie','recu','rupture de stock') NOT NULL DEFAULT 'commander',
    `quantite` INTEGER NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_cpb_produit`
        FOREIGN KEY (`id_produit`) REFERENCES `RawProducts`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_cpb_fournisseur`
        FOREIGN KEY (`id_fournisseur`) REFERENCES `Suppliers`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- PRODUITS TRANSFORMÉS
-- ============================================================
CREATE TABLE IF NOT EXISTS `ProduitTransform` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,
    `commentaires` TEXT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_produit_nom` (`nom`)
);

-- ============================================================
-- FORMATS DES PRODUITS TRANSFORMÉS
-- ============================================================
CREATE TABLE IF NOT EXISTS `FormatProduit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `produit_id` INTEGER NOT NULL,
    `nom_format` VARCHAR(50) NOT NULL,
    `stock_quantity` INTEGER NOT NULL DEFAULT 0,
    `unite_id`  INTEGER NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_format_produit` (`produit_id`, `nom_format`),
    CONSTRAINT `fk_format_produit`
        FOREIGN KEY (`produit_id`) REFERENCES `ProduitTransform`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_format_unite`
        FOREIGN KEY (`unite_id`) REFERENCES `UnitesMesure`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- RECETTES 
-- ============================================================
CREATE TABLE IF NOT EXISTS `RecettesProduit` (
    `format_id` INTEGER NOT NULL,
    `raw_produit_id` INTEGER NOT NULL,
    `quantite_produit_trans` INTEGER NOT NULL,
    `quantite_produit_brut` INTEGER NOT NULL,
    PRIMARY KEY (`format_id`, `raw_produit_id`),
    CONSTRAINT `fk_recette_format`
        FOREIGN KEY (`format_id`) REFERENCES `FormatProduit`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_recette_rawprod`
        FOREIGN KEY (`raw_produit_id`) REFERENCES `RawProducts`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- CLIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS `Clients` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `tel` VARCHAR(20)  NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `web_site` VARCHAR(255) NOT NULL DEFAULT '',
    `person_to_contact` VARCHAR(150) NOT NULL,
    `client_type` ENUM('particulier','epicerie','restaurant') NOT NULL DEFAULT 'particulier',
    `adress` VARCHAR(100) NOT NULL,
    `ville` VARCHAR(50) NOT NULL,
    `region` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_client_email` (`email`)
);

-- ============================================================
-- GRILLE DE PRIX PRODUITS TRANSFORMÉS
-- ============================================================
CREATE TABLE IF NOT EXISTS `PrixProduitTransforme` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `format_id` INTEGER  NOT NULL,
    `client_type` ENUM('particulier','epicerie','restaurant') NOT NULL,
    `quantite_min` INTEGER NOT NULL DEFAULT 1,
    `prix` DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_prix_format_type_qte` (`format_id`, `client_type`, `quantite_min`),
    CONSTRAINT `fk_prix_format`
        FOREIGN KEY (`format_id`) REFERENCES `FormatProduit`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- COMMANDES DE PRODUITS TRANSFORMÉS 
-- ============================================================
CREATE TABLE IF NOT EXISTS `CommandesProduitTransformer` (
    `id` INTEGER  NOT NULL AUTO_INCREMENT,
    `id_client` INTEGER  NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `delivered_at` DATETIME NULL,
    `status` ENUM('recu','rupture de stock','commander','expedier') NOT NULL DEFAULT 'commander',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_cpt_client`
        FOREIGN KEY (`id_client`) REFERENCES `Clients`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- LIGNES DE COMMANDE ( commande <-> format produit)
-- ============================================================
CREATE TABLE IF NOT EXISTS `LignesCommandeTransforme` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `commande_id` INTEGER NOT NULL,
    `format_id` INTEGER NOT NULL,
    `quantite` INTEGER NOT NULL,
    `prix_unitaire` DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_ligne_commande_format` (`commande_id`, `format_id`),
    CONSTRAINT `fk_ligne_commande`
        FOREIGN KEY (`commande_id`) REFERENCES `CommandesProduitTransformer`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_ligne_format`
        FOREIGN KEY (`format_id`) REFERENCES `FormatProduit`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- PLAN DE PRODUCTION
-- ============================================================
CREATE TABLE IF NOT EXISTS `PlanProduction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_format` INTEGER NOT NULL,
    `quantite_plan` INTEGER NOT NULL,
    `date_plan` DATETIME NOT NULL,
    `plan_duration` DECIMAL(8,2) NOT NULL,
    `real_duration` DECIMAL(8,2) NULL,
    `hourly_rate` DECIMAL(8,2) NOT NULL DEFAULT 20.00,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_plan_format`
        FOREIGN KEY (`id_format`) REFERENCES `FormatProduit`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
);


-- ============================================================
-- RÔLES ET PERMISSIONS
-- ============================================================

-- Rôle lecture seule (employés consultation)
CREATE ROLE IF NOT EXISTS 'role_lecture';
GRANT SELECT ON *.* TO 'role_lecture';

-- Rôle opérations (employés saisie)
CREATE ROLE IF NOT EXISTS 'role_operations';
GRANT SELECT, INSERT, UPDATE ON `RawProducts` TO 'role_operations';
GRANT SELECT, INSERT, UPDATE ON `CommandesProduitBrut` TO 'role_operations';
GRANT SELECT, INSERT, UPDATE ON `CommandesProduitTransformer` TO 'role_operations';
GRANT SELECT, INSERT, UPDATE ON `LignesCommandeTransforme`  TO 'role_operations';
GRANT SELECT, INSERT, UPDATE ON `PlanProduction` TO 'role_operations';
GRANT SELECT, INSERT, UPDATE ON `FormatProduit` TO 'role_operations';
GRANT SELECT ON `Clients` TO 'role_operations';
GRANT SELECT ON `Suppliers` TO 'role_operations';
GRANT SELECT ON `PrixProduitTransforme` TO 'role_operations';

-- Rôle gestion (gérant)
CREATE ROLE IF NOT EXISTS 'role_gestion';
GRANT SELECT, INSERT, UPDATE, DELETE ON `Clients` TO 'role_gestion';
GRANT SELECT, INSERT, UPDATE, DELETE ON `Suppliers` TO 'role_gestion';
GRANT SELECT, INSERT, UPDATE, DELETE ON `RawProducts` TO 'role_gestion';
GRANT SELECT, INSERT, UPDATE, DELETE ON `RawProductsSuppliers` TO 'role_gestion';
GRANT SELECT, INSERT, UPDATE, DELETE ON `PrixFournisseurQuantite` TO 'role_gestion';
GRANT SELECT, INSERT, UPDATE, DELETE ON `ProduitTransform` TO 'role_gestion';
GRANT SELECT, INSERT, UPDATE, DELETE ON `FormatProduit` TO 'role_gestion';
GRANT SELECT, INSERT, UPDATE, DELETE ON `RecettesProduit` TO 'role_gestion';
GRANT SELECT, INSERT, UPDATE, DELETE ON `PrixProduitTransforme` TO 'role_gestion';
GRANT SELECT, INSERT, UPDATE, DELETE ON `CommandesProduitBrut` TO 'role_gestion';
GRANT SELECT, INSERT, UPDATE, DELETE ON `CommandesProduitTransformer` TO 'role_gestion';
GRANT SELECT, INSERT, UPDATE, DELETE ON `LignesCommandeTransforme` TO 'role_gestion';
GRANT SELECT, INSERT, UPDATE, DELETE ON `PlanProduction` TO 'role_gestion';
GRANT SELECT, INSERT, UPDATE, DELETE ON `UnitesMesure` TO 'role_gestion';

-- Rôle admin (accès total)
CREATE ROLE IF NOT EXISTS 'role_admin';
GRANT ALL PRIVILEGES ON *.* TO 'role_admin'@'%' WITH GRANT OPTION;

FLUSH PRIVILEGES;

CREATE USER IF NOT EXISTS 'employe1'@'%' IDENTIFIED BY 'admin';
CREATE USER IF NOT EXISTS 'gerant1'@'%' IDENTIFIED BY 'admin';
CREATE USER IF NOT EXISTS 'admin1'@'%' IDENTIFIED BY 'admin';


GRANT 'role_operations' TO 'employe1'@'%';
GRANT 'role_gestion' TO 'gerant1'@'%';
GRANT 'role_admin' TO 'admin1'@'%';


FLUSH PRIVILEGES;

USE perecanuel_db;

-- =====================================
-- UNITÉS DE MESURE
-- =====================================
INSERT INTO `UnitesMesure` (`code`, `nom`, `facteur_conversion`, `unite_base_id`) VALUES
('kg',     'Kilogramme',  1.0,      NULL),
('g',      'Gramme',      1.0,      NULL),
('L',      'Litre',       1.0,      NULL),
('mL',     'Millilitre',  1.0,      NULL),
('u',      'Unité',       1.0,      NULL),
('pce',    'Pièce',       1.0,      NULL),
('caisse', 'Caisse',      1.0,      NULL);

INSERT INTO `UnitesMesure` (`code`, `nom`, `facteur_conversion`, `unite_base_id`) VALUES
('g_c', 'Gramme (converti)', 0.001,    (SELECT id FROM (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'kg') AS t)),
('mg',  'Milligramme',       0.000001, (SELECT id FROM (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'kg') AS t)),
('cL',  'Centilitre',        0.01,     (SELECT id FROM (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'L')  AS t)),
('m3',  'Mètre cube',        1000.0,   (SELECT id FROM (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'L')  AS t));


-- =====================================
-- FOURNISSEURS
-- =====================================
INSERT INTO `Suppliers` (`name`, `tel`, `email`, `web_site`, `person_to_contact`) VALUES
('Fraises de Provence',   '+33 1 23 45 67 89', 'contact@fraisesprovence.fr',  'https://fraisesprovence.fr',  'Jean Dupont'),
('Bio Équitable',         '+33 1 98 76 54 32', 'info@bioequitable.com',        'https://bioequitable.com',    'Marie Martin'),
('Emballages Durand',     '+33 1 55 44 33 22', 'vente@emballagesdurand.fr',    'https://emballagesdurand.fr', 'Pierre Durand'),
('Fournitures Pâtisserie','+33 1 77 66 55 44', 'cmd@fournipat.fr',             'https://fournipat.fr',        'Sophie Bernard'),
('Legumes du Soleil',     '+33 1 33 22 11 00', 'contact@legumessoleil.fr',     'https://legumessoleil.fr',    'Lucas Moreau');


-- =====================================
-- PRODUITS BRUTS
-- =====================================
INSERT INTO `RawProducts` (`nom`, `stock_quantity`, `unite_id`) VALUES
('Fraise',         150,  (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'kg')),
('Pomme',          200,  (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'kg')),
('Banane',          80,  (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'kg')),
('Fraise surgelée', 50,  (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'kg')),
('Myrtille',        30,  (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'kg')),
('Lait',           100,  (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'L')),
('Crème fraîche',   40,  (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'L')),
('Beurre',          25,  (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'kg')),
('Farine',         100,  (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'kg')),
('Sucre',           80,  (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'kg')),
('Levure',          10,  (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'kg')),
('Sel',             50,  (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'kg')),
('Vanille',          5,  (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'kg')),
('Boîte carton',   500,  (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u')),
('Sac kraft',     1000,  (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u'));


-- =====================================
-- ASSOCIATION PRODUITS BRUTS <-> FOURNISSEURS
-- =====================================
INSERT INTO `RawProductsSuppliers` (`supplier_id`, `rawproduct_id`) VALUES
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Fraises de Provence'),    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Fraise')),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Fraises de Provence'),    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Fraise surgelée')),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Bio Équitable'),          (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Pomme')),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Bio Équitable'),          (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Banane')),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Bio Équitable'),          (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Myrtille')),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Bio Équitable'),          (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Lait')),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Bio Équitable'),          (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Crème fraîche')),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Emballages Durand'),      (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Boîte carton')),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Emballages Durand'),      (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sac kraft')),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Fournitures Pâtisserie'), (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Farine')),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Fournitures Pâtisserie'), (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sucre')),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Fournitures Pâtisserie'), (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Levure')),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Fournitures Pâtisserie'), (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sel')),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Fournitures Pâtisserie'), (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Vanille')),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Fournitures Pâtisserie'), (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Beurre')),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Legumes du Soleil'),      (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Fraise'));


-- =====================================
-- PALIERS DE PRIX PAR QUANTITÉ
-- =====================================
INSERT INTO `PrixFournisseurQuantite` (`supplier_id`, `rawproduct_id`, `quantite_min`, `prix_unitaire`) VALUES
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Fraises de Provence'),    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Fraise'),  1,   8.50),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Fraises de Provence'),    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Fraise'),  10,  7.00),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Fraises de Provence'),    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Fraise'),  50,  5.50),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Bio Équitable'),          (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Pomme'),   1,   3.00),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Bio Équitable'),          (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Pomme'),   25,  2.50),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Bio Équitable'),          (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Pomme'),   100, 2.00),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Bio Équitable'),          (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Banane'),  1,   2.50),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Bio Équitable'),          (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Banane'),  20,  2.00),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Bio Équitable'),          (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Lait'),    1,   1.20),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Bio Équitable'),          (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Lait'),    50,  1.00),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Fournitures Pâtisserie'), (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Farine'),  1,   1.50),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Fournitures Pâtisserie'), (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Farine'),  25,  1.20),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Fournitures Pâtisserie'), (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sucre'),   1,   1.80),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Fournitures Pâtisserie'), (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sucre'),   20,  1.50),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Fournitures Pâtisserie'), (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Beurre'),  1,   9.00),
((SELECT `id` FROM `Suppliers` WHERE `name` = 'Fournitures Pâtisserie'), (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Beurre'),  10,  8.00);


-- =====================================
-- COMMANDES DE PRODUITS BRUTS
-- =====================================
INSERT INTO `CommandesProduitBrut` (`commande_id`, `id_produit`, `id_fournisseur`, `unite_price`, `created_at`, `receive_at`, `status`, `quantite`) VALUES
(1, (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Fraise'),       (SELECT `id` FROM `Suppliers` WHERE `name` = 'Fraises de Provence'),    7.00,  '2026-01-15 10:00:00', '2026-01-20', 'recu',            50),
(2, (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Pomme'),        (SELECT `id` FROM `Suppliers` WHERE `name` = 'Bio Équitable'),          2.50,  '2026-02-01 09:30:00', '2026-02-05', 'recu',            30),
(3, (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Farine'),       (SELECT `id` FROM `Suppliers` WHERE `name` = 'Fournitures Pâtisserie'), 1.20,  '2026-02-10 14:00:00', '2026-02-12', 'recu',            25),
(4, (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sucre'),        (SELECT `id` FROM `Suppliers` WHERE `name` = 'Fournitures Pâtisserie'), 1.50,  '2026-02-10 14:30:00', '2026-02-12', 'recu',            20),
(5, (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Beurre'),       (SELECT `id` FROM `Suppliers` WHERE `name` = 'Fournitures Pâtisserie'), 8.00,  '2026-02-15 11:00:00', '2026-02-18', 'recu',            10),
(6, (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Lait'),         (SELECT `id` FROM `Suppliers` WHERE `name` = 'Bio Équitable'),          1.00,  '2026-03-01 08:00:00', NULL,         'commander',       50),
(7, (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Boîte carton'), (SELECT `id` FROM `Suppliers` WHERE `name` = 'Emballages Durand'),      0.50,  '2026-03-05 10:00:00', NULL,         'expedie',        200),
(8, (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Vanille'),      (SELECT `id` FROM `Suppliers` WHERE `name` = 'Fournitures Pâtisserie'), 25.00, '2026-02-20 09:00:00', NULL,         'rupture de stock', 5);


-- =====================================
-- PRODUITS TRANSFORMÉS
-- =====================================
INSERT INTO `ProduitTransform` (`nom`, `commentaires`) VALUES
('Tarte aux fruits', 'Tarte garnie de fruits frais de saison'),
('Muffin myrtille',  'Muffin américain aux myrtilles'),
('Cake',             'Gâteau familial varié'),
('Panna cotta',      'Dessert italien à la crème'),
('Confiture maison', 'Confiture artisanale de fruits'),
('Crème brûlée',     'Dessert français à la crème caramélisée'),
('Éclair',           'Pâtisserie française garnie'),
('Madeleine',        'Petit gâteau au miel');


-- =====================================
-- FORMATS DES PRODUITS TRANSFORMÉS
-- =====================================
INSERT INTO `FormatProduit` (`produit_id`, `nom_format`, `stock_quantity`, `unite_id`) VALUES
((SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits'), 'Taille S (4 parts)',  10, (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u')),
((SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits'), 'Taille M (6 parts)',  15, (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u')),
((SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits'), 'Taille L (10 parts)',  5, (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u')),
((SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille'),  'Muffin unitaire',     50, (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u')),
((SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille'),  'Boîte de 6',          20, (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u')),
((SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille'),  'Boîte de 12',         10, (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u')),
((SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake'),             'Mini cake',           30, (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u')),
((SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake'),             'Cake familial',       12, (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u')),
((SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta'),      'Verrine',             40, (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u')),
((SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta'),      'Grand format',        15, (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u')),
((SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Confiture maison'), 'Pot 250g',            25, (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u')),
((SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Confiture maison'), 'Pot 500g',            15, (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u')),
((SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Crème brûlée'),     'Crème brûlée verrine',30, (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u')),
((SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Éclair'),           'Taille standard',     20, (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u')),
((SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Madeleine'),        'Madeleine unitaire',  60, (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u')),
((SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Madeleine'),        'Boîte de 8',          15, (SELECT `id` FROM `UnitesMesure` WHERE `code` = 'u'));


-- =====================================
-- RECETTES
-- =====================================

-- Tarte aux fruits – Taille M (6 parts)
INSERT INTO `RecettesProduit` (`format_id`, `raw_produit_id`, `quantite_produit_trans`, `quantite_produit_brut`) VALUES
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille M (6 parts)'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Fraise'), 6, 800
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille M (6 parts)'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Pomme'), 6, 500
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille M (6 parts)'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Farine'), 6, 300
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille M (6 parts)'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Beurre'), 6, 200
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille M (6 parts)'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sucre'), 6, 150
);

-- Tarte aux fruits – Taille S (4 parts)
INSERT INTO `RecettesProduit` (`format_id`, `raw_produit_id`, `quantite_produit_trans`, `quantite_produit_brut`) VALUES
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille S (4 parts)'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Fraise'), 4, 500
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille S (4 parts)'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Farine'), 4, 200
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille S (4 parts)'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Beurre'), 4, 130
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille S (4 parts)'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sucre'), 4, 100
);

-- Tarte aux fruits – Taille L (10 parts)
INSERT INTO `RecettesProduit` (`format_id`, `raw_produit_id`, `quantite_produit_trans`, `quantite_produit_brut`) VALUES
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille L (10 parts)'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Fraise'), 10, 1200
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille L (10 parts)'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Pomme'), 10, 800
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille L (10 parts)'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Farine'), 10, 500
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille L (10 parts)'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Beurre'), 10, 300
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille L (10 parts)'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sucre'), 10, 250
);

-- Muffin myrtille – Muffin unitaire
INSERT INTO `RecettesProduit` (`format_id`, `raw_produit_id`, `quantite_produit_trans`, `quantite_produit_brut`) VALUES
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Muffin unitaire'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Myrtille'), 1, 80
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Muffin unitaire'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Farine'), 1, 100
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Muffin unitaire'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sucre'), 1, 60
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Muffin unitaire'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Beurre'), 1, 40
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Muffin unitaire'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Lait'), 1, 50
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Muffin unitaire'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Levure'), 1, 2
);

-- Cake – Cake familial
INSERT INTO `RecettesProduit` (`format_id`, `raw_produit_id`, `quantite_produit_trans`, `quantite_produit_brut`) VALUES
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Cake familial'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Farine'), 1, 400
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Cake familial'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sucre'), 1, 300
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Cake familial'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Beurre'), 1, 200
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Cake familial'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Lait'), 1, 150
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Cake familial'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Levure'), 1, 10
);

-- Cake – Mini cake
INSERT INTO `RecettesProduit` (`format_id`, `raw_produit_id`, `quantite_produit_trans`, `quantite_produit_brut`) VALUES
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Mini cake'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Farine'), 1, 150
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Mini cake'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sucre'), 1, 100
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Mini cake'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Beurre'), 1, 80
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Mini cake'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Lait'), 1, 60
);

-- Panna cotta – Verrine
INSERT INTO `RecettesProduit` (`format_id`, `raw_produit_id`, `quantite_produit_trans`, `quantite_produit_brut`) VALUES
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Verrine'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Crème fraîche'), 1, 200
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Verrine'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Lait'), 1, 100
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Verrine'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sucre'), 1, 40
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Verrine'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Vanille'), 1, 5
);

-- Panna cotta – Grand format
INSERT INTO `RecettesProduit` (`format_id`, `raw_produit_id`, `quantite_produit_trans`, `quantite_produit_brut`) VALUES
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Grand format'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Crème fraîche'), 1, 500
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Grand format'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Lait'), 1, 250
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Grand format'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sucre'), 1, 100
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Grand format'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Vanille'), 1, 10
);

-- Confiture maison – Pot 500g
INSERT INTO `RecettesProduit` (`format_id`, `raw_produit_id`, `quantite_produit_trans`, `quantite_produit_brut`) VALUES
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Pot 500g'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Confiture maison')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Fraise'), 1, 400
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Pot 500g'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Confiture maison')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sucre'), 1, 250
);

-- Confiture maison – Pot 250g
INSERT INTO `RecettesProduit` (`format_id`, `raw_produit_id`, `quantite_produit_trans`, `quantite_produit_brut`) VALUES
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Pot 250g'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Confiture maison')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Fraise'), 1, 200
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Pot 250g'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Confiture maison')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sucre'), 1, 130
);

-- Crème brûlée – Crème brûlée verrine
INSERT INTO `RecettesProduit` (`format_id`, `raw_produit_id`, `quantite_produit_trans`, `quantite_produit_brut`) VALUES
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Crème brûlée verrine'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Crème brûlée')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Crème fraîche'), 1, 180
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Crème brûlée verrine'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Crème brûlée')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sucre'), 1, 50
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Crème brûlée verrine'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Crème brûlée')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Vanille'), 1, 3
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Crème brûlée verrine'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Crème brûlée')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Lait'), 1, 50
);

-- Éclair – Taille standard
INSERT INTO `RecettesProduit` (`format_id`, `raw_produit_id`, `quantite_produit_trans`, `quantite_produit_brut`) VALUES
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille standard'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Éclair')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Farine'), 1, 80
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille standard'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Éclair')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Beurre'), 1, 40
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille standard'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Éclair')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Crème fraîche'), 1, 100
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille standard'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Éclair')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sucre'), 1, 30
);

-- Madeleine – Madeleine unitaire
INSERT INTO `RecettesProduit` (`format_id`, `raw_produit_id`, `quantite_produit_trans`, `quantite_produit_brut`) VALUES
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Madeleine unitaire'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Madeleine')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Farine'), 1, 60
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Madeleine unitaire'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Madeleine')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Sucre'), 1, 40
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Madeleine unitaire'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Madeleine')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Beurre'), 1, 30
),
(
    (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Madeleine unitaire'
        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Madeleine')),
    (SELECT `id` FROM `RawProducts` WHERE `nom` = 'Lait'), 1, 20
);


-- =====================================
-- CLIENTS
-- =====================================
INSERT INTO `Clients` (`name`, `tel`, `email`, `web_site`, `person_to_contact`, `client_type`, `adress`, `ville`, `region`) VALUES
('Dupont Family',        '+33 6 12 34 56 78', 'dupont@email.fr',                   '',                                    'Pierre Dupont',   'particulier', '12 Rue de la Paix',                    'Paris',            'Île-de-France'),
('Martin Household',     '+33 6 23 45 67 89', 'martin@email.fr',                   '',                                    'Julie Martin',    'particulier', '45 Avenue Victor Hugo',                'Lyon',             'Auvergne-Rhône-Alpes'),
('Bernard Residence',    '+33 6 34 56 78 90', 'bernard@email.fr',                  '',                                    'Alain Bernard',   'particulier', '8 Boulevard Saint-Michel',             'Marseille',        'Provence-Alpes-Côte d Azur'),
('Épicerie du Centre',   '+33 1 11 22 33 44', 'contact@epicerieducentre.fr',        'https://epicerieducentre.fr',         'Marie Lefebvre',  'epicerie',    '23 Rue Principale',                    'Lille',            'Hauts-de-France'),
('Bio & Co',             '+33 1 22 33 44 55', 'info@bioandco.fr',                   'https://bioandco.fr',                 'Sophie Rousseau', 'epicerie',    '78 Avenue des Champs-Élysées',         'Paris',            'Île-de-France'),
('Délices de la Vie',    '+33 4 44 55 66 77', 'contact@delicesdelavie.fr',          'https://delicesdelavie.fr',           'Claire Moreau',   'epicerie',    '5 Place du Marché',                    'Toulouse',         'Occitanie'),
('Le Petit Gourmet',     '+33 1 33 44 55 66', 'reservation@lepetitgourmet.fr',      'https://lepetitgourmet.fr',           'Chef Antoine',    'restaurant',  '30 Rue du Faubourg Saint-Honoré',      'Paris',            'Île-de-France'),
('La Table de Provence', '+33 4 55 66 77 88', 'contact@latabledeprovence.fr',       'https://latabledeprovence.fr',        'Chef Jean-Michel','restaurant',  '12 Cours Mirabeau',                    'Aix-en-Provence',  'Provence-Alpes-Côte d Azur'),
('Le Jardin Secret',     '+33 2 66 77 88 99', 'info@lejardinsecret.fr',             'https://lejardinsecret.fr',           'Chef Marie',      'restaurant',  '45 Quai de la Fosse',                  'Nantes',           'Pays de la Loire');


-- =====================================
-- GRILLE DE PRIX PRODUITS TRANSFORMÉS
-- =====================================
INSERT INTO `PrixProduitTransforme` (`format_id`, `client_type`, `quantite_min`, `prix`) VALUES
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille M (6 parts)'  AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')), 'particulier', 1,  28.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille M (6 parts)'  AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')), 'epicerie',    1,  22.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille M (6 parts)'  AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')), 'restaurant',  1,  20.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille M (6 parts)'  AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')), 'restaurant',  5,  18.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille S (4 parts)'  AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')), 'particulier', 1,  18.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille S (4 parts)'  AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')), 'epicerie',    1,  15.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille S (4 parts)'  AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')), 'restaurant',  1,  13.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille L (10 parts)' AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')), 'particulier', 1,  42.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille L (10 parts)' AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')), 'epicerie',    1,  35.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille L (10 parts)' AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')), 'restaurant',  1,  32.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Muffin unitaire'     AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),  'particulier', 1,   3.50),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Muffin unitaire'     AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),  'epicerie',    1,   2.80),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Muffin unitaire'     AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),  'restaurant',  1,   2.50),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Muffin unitaire'     AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),  'restaurant',  10,  2.20),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Boîte de 6'          AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),  'particulier', 1,  18.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Boîte de 6'          AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),  'epicerie',    1,  15.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Boîte de 6'          AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),  'restaurant',  1,  14.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Boîte de 12'         AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),  'particulier', 1,  32.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Boîte de 12'         AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),  'epicerie',    1,  27.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Boîte de 12'         AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),  'restaurant',  1,  25.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Cake familial'       AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),             'particulier', 1,  25.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Cake familial'       AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),             'epicerie',    1,  20.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Cake familial'       AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),             'restaurant',  1,  18.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Cake familial'       AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),             'restaurant',  3,  16.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Mini cake'           AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),             'particulier', 1,  10.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Mini cake'           AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),             'epicerie',    1,   8.50),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Mini cake'           AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),             'restaurant',  1,   8.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Verrine'             AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),      'particulier', 1,   5.50),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Verrine'             AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),      'epicerie',    1,   4.50),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Verrine'             AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),      'restaurant',  1,   4.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Verrine'             AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),      'restaurant',  10,  3.50),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Grand format'        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),      'particulier', 1,  14.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Grand format'        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),      'epicerie',    1,  12.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Grand format'        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),      'restaurant',  1,  11.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Pot 500g'            AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Confiture maison')), 'particulier', 1,   8.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Pot 500g'            AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Confiture maison')), 'epicerie',    1,   6.50),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Pot 500g'            AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Confiture maison')), 'restaurant',  1,   6.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Pot 250g'            AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Confiture maison')), 'particulier', 1,   4.50),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Pot 250g'            AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Confiture maison')), 'epicerie',    1,   3.80),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Pot 250g'            AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Confiture maison')), 'restaurant',  1,   3.50),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Crème brûlée verrine'AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Crème brûlée')),    'particulier', 1,   5.50),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Crème brûlée verrine'AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Crème brûlée')),    'epicerie',    1,   4.50),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Crème brûlée verrine'AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Crème brûlée')),    'restaurant',  1,   4.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille standard'     AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Éclair')),           'particulier', 1,   4.50),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille standard'     AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Éclair')),           'epicerie',    1,   3.80),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille standard'     AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Éclair')),           'restaurant',  1,   3.50),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Madeleine unitaire'  AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Madeleine')),        'particulier', 1,   2.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Madeleine unitaire'  AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Madeleine')),        'epicerie',    1,   1.60),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Madeleine unitaire'  AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Madeleine')),        'restaurant',  1,   1.40),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Madeleine unitaire'  AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Madeleine')),        'restaurant',  20,  1.20),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Boîte de 8'          AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Madeleine')),        'particulier', 1,  14.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Boîte de 8'          AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Madeleine')),        'epicerie',    1,  12.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Boîte de 8'          AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Madeleine')),        'restaurant',  1,  11.00);


-- =====================================
-- COMMANDES DE PRODUITS TRANSFORMÉS
-- =====================================
INSERT INTO `CommandesProduitTransformer` (`id_client`, `created_at`, `delivered_at`, `status`) VALUES
((SELECT `id` FROM `Clients` WHERE `name` = 'Dupont Family'),        '2026-02-01 10:00:00', '2026-02-03 15:30:00', 'recu'),
((SELECT `id` FROM `Clients` WHERE `name` = 'Le Petit Gourmet'),     '2026-02-05 09:00:00', '2026-02-07 11:00:00', 'recu'),
((SELECT `id` FROM `Clients` WHERE `name` = 'Épicerie du Centre'),   '2026-02-10 14:00:00', '2026-02-12 10:00:00', 'recu'),
((SELECT `id` FROM `Clients` WHERE `name` = 'Bio & Co'),             '2026-02-15 08:30:00', '2026-02-17 09:00:00', 'recu'),
((SELECT `id` FROM `Clients` WHERE `name` = 'Martin Household'),     '2026-02-20 16:00:00', '2026-02-22 18:00:00', 'recu'),
((SELECT `id` FROM `Clients` WHERE `name` = 'La Table de Provence'), '2026-02-25 11:00:00', '2026-02-27 12:00:00', 'recu'),
((SELECT `id` FROM `Clients` WHERE `name` = 'Bernard Residence'),    '2026-03-01 10:00:00', NULL,                  'commander'),
((SELECT `id` FROM `Clients` WHERE `name` = 'Le Jardin Secret'),     '2026-03-05 09:30:00', NULL,                  'expedier'),
((SELECT `id` FROM `Clients` WHERE `name` = 'Délices de la Vie'),    '2026-03-10 14:00:00', NULL,                  'commander');


-- =====================================
-- LIGNES DE COMMANDE
-- =====================================
INSERT INTO `LignesCommandeTransforme` (`commande_id`, `format_id`, `quantite`, `prix_unitaire`) VALUES
(1, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille M (6 parts)' AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),  2, 28.00),
(1, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Boîte de 6'         AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),   1, 18.00),
(2, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Verrine'             AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),       20, 4.00),
(2, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille M (6 parts)' AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),  3, 20.00),
(2, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Cake familial'       AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),              2, 18.00),
(3, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Pot 500g'            AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Confiture maison')),  5,  6.50),
(3, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Boîte de 6'          AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),   3, 15.00),
(4, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Muffin unitaire'     AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),   30, 2.80),
(4, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille L (10 parts)' AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),  2, 35.00),
(5, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Cake familial'       AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),              1, 25.00),
(5, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Verrine'             AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),       4,  5.50),
(6, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille M (6 parts)' AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),  5, 20.00),
(6, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Verrine'             AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),       30,  4.00),
(6, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille standard'     AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Éclair')),            15,  3.50),
(7, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Pot 500g'            AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Confiture maison')),  2,  8.00),
(8, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Verrine'             AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),       25,  4.00),
(8, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille standard'     AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Éclair')),            20,  3.50),
(9, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Boîte de 6'          AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),   4, 15.00),
(9, (SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Boîte de 8'          AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Madeleine')),         2, 12.00);


-- =====================================
-- PLAN DE PRODUCTION
-- =====================================
INSERT INTO `PlanProduction` (`id_format`, `quantite_plan`, `date_plan`, `plan_duration`, `real_duration`, `hourly_rate`) VALUES
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille M (6 parts)'  AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')), 10,  '2026-02-01 08:00:00', 4.00, 3.50, 20.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Verrine'             AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),       50,  '2026-02-05 08:00:00', 3.00, 2.80, 20.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Boîte de 6'          AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),   20,  '2026-02-10 08:00:00', 2.50, 2.20, 20.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Cake familial'       AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Cake')),              15,  '2026-02-15 08:00:00', 5.00, 4.80, 20.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Pot 500g'            AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Confiture maison')),   30,  '2026-02-20 08:00:00', 6.00, 5.50, 20.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille standard'     AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Éclair')),            40,  '2026-02-25 08:00:00', 4.00, 3.80, 20.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Taille L (10 parts)' AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Tarte aux fruits')),  8,   '2026-03-15 08:00:00', 5.00, NULL, 22.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Muffin unitaire'     AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),   100, '2026-03-18 08:00:00', 3.00, NULL, 20.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Boîte de 12'         AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Muffin myrtille')),   15,  '2026-03-20 08:00:00', 4.00, NULL, 20.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Grand format'        AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Panna cotta')),        20,  '2026-03-22 08:00:00', 4.50, NULL, 22.00),
((SELECT `id` FROM `FormatProduit` WHERE `nom_format` = 'Pot 250g'            AND `produit_id` = (SELECT `id` FROM `ProduitTransform` WHERE `nom` = 'Confiture maison')),   40,  '2026-03-25 08:00:00', 5.00, NULL, 20.00);