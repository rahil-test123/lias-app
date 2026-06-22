-- ==============================================================
-- LIAS - Données de test
-- INSERT IGNORE : insère seulement si la ligne n'existe pas encore
-- Les données créées via l'interface sont CONSERVÉES au redémarrage
-- Mot de passe par défaut pour tous : Admin1234!
-- ==============================================================

-- ==============================================================
-- ÉQUIPES
-- ==============================================================
INSERT IGNORE INTO equipe (id, nom, description, date_creation) VALUES
(1, 'Informatique Médicale', 'Traitement de données médicales et IA en santé', '2015-01-10'),
(2, 'Systèmes Distribués', 'Architectures distribuées et cloud computing', '2016-03-15'),
(3, 'Vision Artificielle', 'Traitement d''images et apprentissage profond', '2018-06-01'),
(4, 'Sécurité & Cryptographie', 'Cybersécurité et protocoles cryptographiques', '2019-09-01');

-- ==============================================================
-- MEMBRES  (Hash BCrypt de "Admin1234!")
-- ==============================================================
INSERT IGNORE INTO membre (id, nom, prenom, email, password, statut, role, actif,
                    biographie, etablissement_origine, date_embauche, date_affiliation,
                    created_at, updated_at) VALUES
(1, 'Msouhli', 'Rahil', 'rahil.msouhli123@gmail.com',
 '$2a$10$Z8be9cph8z5U4ml/eqP5eegH4fPd3/TWQU2iSCtHw.6qwe9pThqEi',
 'PERMANENT', 'ROLE_ADMIN', 1,
 'Administrateur du laboratoire LIAS.',
 'Université de Batna 2', '2010-09-01', '2010-09-01', NOW(), NOW()),

(2, 'Meziane', 'Fatima', 'directeur@lias.dz',
 '$2a$10$Z8be9cph8z5U4ml/eqP5eegH4fPd3/TWQU2iSCtHw.6qwe9pThqEi',
 'PERMANENT', 'ROLE_DIRECTEUR', 1,
 'Co-directrice du laboratoire, experte en systèmes distribués.',
 'Université de Batna 2', '2012-01-15', '2012-01-15', NOW(), NOW()),

(3, 'Hadj', 'Karim', 'karim.hadj@lias.dz',
 '$2a$10$Z8be9cph8z5U4ml/eqP5eegH4fPd3/TWQU2iSCtHw.6qwe9pThqEi',
 'PERMANENT', 'ROLE_MEMBRE', 1,
 'Chercheur senior en traitement d''images médicales.',
 'Université de Batna 2', '2014-03-01', '2014-03-01', NOW(), NOW()),

(4, 'Boudra', 'Lina', 'lina.boudra@lias.dz',
 '$2a$10$Z8be9cph8z5U4ml/eqP5eegH4fPd3/TWQU2iSCtHw.6qwe9pThqEi',
 'ASSOCIE', 'ROLE_MEMBRE', 1,
 'Chercheuse associée en vision artificielle.',
 'USTHB Alger', '2017-09-01', '2017-09-01', NOW(), NOW()),

(5, 'Ouali', 'Sofiane', 'sofiane.ouali@lias.dz',
 '$2a$10$Z8be9cph8z5U4ml/eqP5eegH4fPd3/TWQU2iSCtHw.6qwe9pThqEi',
 'DOCTORANT', 'ROLE_DOCTORANT', 1,
 'Doctorant en 2ème année, thèse sur l''apprentissage fédéré.',
 'Université de Batna 2', '2022-10-01', '2022-10-01', NOW(), NOW()),

(6, 'Khelil', 'Sara', 'sara.khelil@lias.dz',
 '$2a$10$Z8be9cph8z5U4ml/eqP5eegH4fPd3/TWQU2iSCtHw.6qwe9pThqEi',
 'DOCTORANT', 'ROLE_DOCTORANT', 1,
 'Doctorante 1ère année, sujet: segmentation sémantique.',
 'Université de Batna 2', '2023-10-01', '2023-10-01', NOW(), NOW()),

(7, 'Rouabah', 'Omar', 'omar.rouabah@lias.dz',
 '$2a$10$Z8be9cph8z5U4ml/eqP5eegH4fPd3/TWQU2iSCtHw.6qwe9pThqEi',
 'PERMANENT', 'ROLE_MEMBRE', 1,
 'Spécialiste en cryptographie et sécurité des réseaux.',
 'Université de Biskra', '2016-02-01', '2016-02-01', NOW(), NOW()),

(8, 'Amrani', 'Nadia', 'nadia.amrani@lias.dz',
 '$2a$10$Z8be9cph8z5U4ml/eqP5eegH4fPd3/TWQU2iSCtHw.6qwe9pThqEi',
 'ASSOCIE', 'ROLE_MEMBRE', 1,
 'Chercheuse en bases de données distribuées.',
 'ESI Alger', '2019-09-01', '2019-09-01', NOW(), NOW());

-- ==============================================================
-- AFFILIATIONS
-- ==============================================================
INSERT IGNORE INTO affiliation (id, id_membre, id_equipe, date_debut, date_fin) VALUES
(1, 1, 1, '2010-09-01', NULL),
(2, 2, 2, '2012-01-15', NULL),
(3, 3, 1, '2014-03-01', NULL),
(4, 4, 3, '2017-09-01', NULL),
(5, 5, 3, '2022-10-01', NULL),
(6, 6, 3, '2023-10-01', NULL),
(7, 7, 4, '2016-02-01', NULL),
(8, 8, 2, '2019-09-01', NULL),
(9, 3, 3, '2020-01-01', NULL);

-- ==============================================================
-- MANDATS
-- ==============================================================
INSERT IGNORE INTO mandat (id, id_membre, role, date_debut, date_fin) VALUES
(1, 1, 'DIRECTEUR',      '2020-01-01', NULL),
(2, 2, 'VICE_DIRECTEUR', '2020-01-01', NULL),
(3, 7, 'CHEF_EQUIPE',    '2021-06-01', NULL),
(4, 3, 'CHEF_EQUIPE',    '2019-09-01', NULL);

-- ==============================================================
-- PUBLICATIONS
-- ==============================================================
INSERT IGNORE INTO publication (id, titre, auteurs, annee, type, lien, id_membre, id_equipe) VALUES
(1, 'Deep Learning for Medical Image Segmentation: A Survey',
   'K. Hadj, A. Benali, L. Boudra', 2023,
   'ARTICLE', 'https://doi.org/10.1016/j.media.2023.001', 3, 1),

(2, 'Federated Learning with Differential Privacy in Healthcare',
   'S. Ouali, A. Benali', 2024,
   'CONFERENCE', 'https://arxiv.org/abs/2024.001', 5, 3),

(3, 'A Blockchain-Based Framework for Secure Data Sharing',
   'O. Rouabah, N. Amrani', 2023,
   'ARTICLE', 'https://doi.org/10.1109/tifs.2023.001', 7, 4),

(4, 'Cloud-Native Microservices: Patterns and Best Practices',
   'F. Meziane, N. Amrani', 2022,
   'CONFERENCE', 'https://doi.org/10.1145/conf.2022.001', 2, 2),

(5, 'Semantic Segmentation of Satellite Images Using U-Net',
   'S. Khelil, L. Boudra', 2024,
   'CONFERENCE', 'https://arxiv.org/abs/2024.015', 6, 3),

(6, 'Post-Quantum Cryptography: Lattice-Based Approaches',
   'O. Rouabah', 2024,
   'ARTICLE', 'https://doi.org/10.1007/crypto.2024.001', 7, 4),

(7, 'Distributed Graph Processing for Large-Scale Social Networks',
   'F. Meziane, N. Amrani, K. Hadj', 2023,
   'ARTICLE', 'https://doi.org/10.1007/vldb.2023.001', 2, 2),

(8, 'Transfer Learning for Arabic Text Classification',
   'A. Benali, S. Ouali', 2022,
   'CONFERENCE', 'https://arxiv.org/abs/2022.089', 1, 1);

-- ==============================================================
-- ÉVÉNEMENTS
-- ==============================================================
INSERT IGNORE INTO evenement (id, titre, description, type, date_debut, date_fin, lieu, id_organisateur) VALUES
(1, 'Séminaire IA & Santé 2026',
   'Séminaire annuel sur les applications de l''IA dans le domaine médical.',
   'SEMINAIRE', '2026-06-10', '2026-06-10', 'Salle de conférences, Bâtiment B', 1),

(2, 'Workshop Deep Learning 2026',
   'Formation intensive sur les réseaux de neurones profonds avec PyTorch.',
   'WORKSHOP', '2026-07-05', '2026-07-07', 'Labo Informatique 201', 3),

(3, 'Conférence Nationale RNTIC 2026',
   'Participation à la conférence nationale sur les TIC et leurs applications.',
   'CONFERENCE', '2026-09-15', '2026-09-17', 'Campus Universitaire Batna', 2),

(4, 'Conférence Internationale ICAIT 2027',
   'Participation à la conférence internationale sur l''IA et les nouvelles technologies.',
   'CONFERENCE', '2027-02-01', '2027-02-03', 'Centre de conférences Alger', 1),

(5, 'Séminaire Sécurité des Systèmes',
   'Présentation des dernières avancées en cryptographie post-quantique.',
   'SEMINAIRE', '2026-06-25', '2026-06-25', 'Amphithéâtre B, Bâtiment C', 7),

(6, 'Workshop NLP & Arabe',
   'Atelier sur le traitement automatique de la langue arabe.',
   'WORKSHOP', '2026-08-10', '2026-08-11', 'Salle TP 201', 1);

-- ==============================================================
-- MATÉRIELS
-- ==============================================================
INSERT IGNORE INTO materiel (id, nom, description, quantite_total, date_arrivage) VALUES
(1, 'MacBook Pro M3',
   'Ordinateur portable Apple MacBook Pro 14" M3 16GB RAM 512GB SSD', 5, '2024-01-15'),
(2, 'Dell Workstation',
   'Dell Precision 5570 - i9 32GB RAM 1TB SSD', 8, '2023-06-10'),
(3, 'GPU NVIDIA RTX 4090',
   'Carte graphique pour calcul GPU - deep learning', 3, '2024-02-20'),
(4, 'Écran 4K 27"',
   'Moniteur Dell UltraSharp U2723D', 12, '2023-09-05'),
(5, 'Serveur NAS',
   'Synology DS923+ - Stockage réseau 40TB', 2, '2024-03-01'),
(6, 'Imprimante 3D',
   'Bambu Lab X1 Carbon - Impression 3D haute précision', 1, '2024-04-10'),
(7, 'Tableau blanc interactif',
   'Samsung Flip 4 - 85 pouces', 2, '2023-11-15'),
(8, 'Switch réseau',
   'Cisco Catalyst 9200 - 48 ports gigabit', 4, '2023-08-20');

-- ==============================================================
-- ATTRIBUTIONS MATÉRIEL
-- ==============================================================
INSERT IGNORE INTO attribution_materiel (id, id_materiel, id_membre, quantite, date_attribution) VALUES
(1,  1, 1, 1, '2024-01-20'),
(2,  1, 2, 1, '2024-01-20'),
(3,  1, 3, 1, '2024-01-25'),
(4,  2, 4, 1, '2023-06-15'),
(5,  2, 5, 1, '2023-06-15'),
(6,  2, 6, 1, '2023-09-01'),
(7,  2, 7, 1, '2023-07-01'),
(8,  3, 3, 1, '2024-02-25'),
(9,  3, 5, 1, '2024-03-01'),
(10, 4, 1, 1, '2023-09-10'),
(11, 4, 2, 1, '2023-09-10'),
(12, 4, 3, 1, '2023-09-15'),
(13, 8, 7, 1, '2023-08-25'),
(14, 8, 8, 1, '2023-08-25');

-- ==============================================================
-- DEMANDES D'ADHÉSION
-- ==============================================================
INSERT IGNORE INTO demande_adhesion
    (id, nom, prenom, email, cv, motivation, statut, date_soumission, id_directeur, date_decision)
VALUES
(1, 'Cherif', 'Amine', 'amine.cherif@univ.dz', NULL,
 'Je suis doctorant en IA et souhaite rejoindre le LIAS pour collaborer sur des projets de ML.',
 'ACCEPTEE', '2024-02-10 10:00:00', 1, '2024-02-15 14:00:00'),

(2, 'Boutaleb', 'Meriem', 'meriem.boutaleb@esi.dz', NULL,
 'Chercheuse en NLP, intéressée par les travaux du laboratoire sur le traitement de l''arabe.',
 'EN_ATTENTE', '2024-11-20 09:00:00', NULL, NULL),

(3, 'Zerrouk', 'Youcef', 'youcef.zerrouk@univ-bejaia.dz', NULL,
 'Thésard en sécurité des réseaux, souhaite collaborer avec l''équipe Sécurité & Cryptographie.',
 'EN_ATTENTE', '2024-12-05 15:00:00', NULL, NULL),

(4, 'Hadjou', 'Asma', 'asma.hadjou@usthb.dz', NULL,
 'Maître de conférences, spécialisée en vision par ordinateur.',
 'REFUSEE', '2024-09-01 08:00:00', 2, '2024-09-10 10:00:00');

-- ==============================================================
-- NOTIFICATIONS
-- ==============================================================
INSERT IGNORE INTO notification (id, id_membre, message, lu, date_creation) VALUES
(1, 5, 'Votre publication "Federated Learning" a été enregistrée avec succès.', 1, '2024-06-01 10:00:00'),
(2, 6, 'Votre inscription au Workshop Deep Learning est confirmée.', 1, '2024-04-01 09:00:00'),
(3, 1, 'Nouvelle demande d''adhésion de Meriem Boutaleb en attente de traitement.', 0, '2024-11-20 09:05:00'),
(4, 2, 'Nouvelle demande d''adhésion de Meriem Boutaleb en attente de traitement.', 0, '2024-11-20 09:05:00'),
(5, 1, 'Nouvelle demande d''adhésion de Youcef Zerrouk en attente de traitement.', 0, '2024-12-05 15:05:00'),
(6, 5, 'Rappel : soutenance à mi-parcours prévue le 20 janvier 2025.', 0, '2025-01-10 08:00:00'),
(7, 3, 'Votre publication "Deep Learning for Medical Image Segmentation" a été ajoutée.', 1, '2023-11-01 11:00:00'),
(8, 7, 'Matériel attribué : Switch réseau Cisco Catalyst 9200.', 1, '2023-08-25 14:00:00');

-- ==============================================================
-- HISTORIQUE ACTIONS
-- ==============================================================
INSERT IGNORE INTO historique_action (id, id_membre, action, details, date_action) VALUES
(1, 1, 'CREATION_MEMBRE',    'Création du compte membre: fatima.meziane@lias.dz', '2024-01-10 09:00:00'),
(2, 1, 'CREATION_MEMBRE',    'Création du compte membre: karim.hadj@lias.dz', '2024-01-10 09:05:00'),
(3, 1, 'ACCEPTATION_ADHESION', 'Acceptation de la demande d''adhésion de Amine Cherif', '2024-02-15 14:00:00'),
(4, 2, 'REFUS_ADHESION',     'Refus de la demande d''adhésion de Asma Hadjou', '2024-09-10 10:00:00'),
(5, 1, 'ATTRIBUTION_MATERIEL', 'Attribution de MacBook Pro M3 à Ahmed Benali', '2024-01-20 10:00:00'),
(6, 1, 'CREATION_EVENEMENT', 'Création de l''événement: Séminaire IA & Santé 2026', '2024-02-01 09:00:00'),
(7, 1, 'CHANGEMENT_STATUT',  'Statut de sofiane.ouali@lias.dz changé de ASSOCIE à DOCTORANT', '2022-10-05 08:00:00');
