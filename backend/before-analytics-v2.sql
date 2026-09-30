PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    business TEXT,
    website TEXT,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('c0fb68da-cf70-489b-a646-f46cd5b95c2c','ELIJAH PRECIOUS OSAGIE','preciouselijah794@gmail.com','Jsjsj','https://re.com','311adb880f42eba49e56afb4ba02eb44b63c5df1207f9400e7ccafa328225c78','2026-09-21 17:58:06','2026-09-21 17:58:06');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('0239ec67-5741-4fd8-a9dd-cf80f3858b5f','Precious Elijah','preciouselija4@gmail.com','Jeej','https://hi.com','75fd4b9f7d4adac9854960080dbaf52e31a230d6af854c8ae146cb7f998eecb6','2026-09-21 18:01:27','2026-09-21 18:01:27');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('1fb0d873-d252-41f5-b176-380032af1e5c','Precious Elijah','precioush794@gmail.com','Ndnnd','https://hi.com','0b5eaa7baf1c8cf580277af1e6bfe1eaf907bf4b25908acaeaebad231b2a9723','2026-09-21 18:05:33','2026-09-21 18:05:33');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('af09495c-f665-410b-9417-18bdf6a671c8','ncnc','nnn@gmail.com','mmd','http://we.com','b6836ea1be0613574b1871b0fe1b74ba6841edbbc3e3700c3a6205e7e64f119f','2026-09-21 18:07:13','2026-09-21 18:07:13');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('456b8411-0bfc-47d0-a807-66d5a717c53e','Precious Elijah','precioushll794@gmail.com','Ndnnd','https://hi.com','0dc2ed243151cf752d66576596b52305d061e0b329d1912f875b45e1b00b9e76','2026-09-21 18:14:45','2026-09-21 18:14:45');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('67ec3ecd-4763-49fb-b9c2-a283eb14b32d','Precious Elijah','preciouselijahyhshshshs794@gmail.com','Hwjaj',NULL,'1c0fd5825c4bb150f2fa29a07824c3576175c019707054c76172dc9537d678ee','2026-09-21 18:16:27','2026-09-21 18:16:27');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('198e3d02-a366-4df5-8005-85ae9b6333c5','Eejjsej','precioubbbbbnnnselijah794@gmail.com',NULL,NULL,'c5b1e608b2ac823295a54f0fa4f9e28ccb4cb969500f7e7445d31df592e843e6','2026-09-21 18:26:29','2026-09-21 18:26:29');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('ff27d8ba-a9e4-4a99-8d08-26d6ac62e3f4','Precious Elijah','plijah794@gmail.com',NULL,NULL,'8e6e3ba819fd030b5f6659b20f4168dd35efd503fc59790ad1f54d7e188f7648','2026-09-21 18:31:41','2026-09-21 18:31:41');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('6697b9d5-f428-4f45-bae3-367ca26ee5cc','nnc','d@gmail.com',NULL,NULL,'edd7788bf80ba5e4f6970e21b938d602a21f973cefc529b56222231f3eedf685','2026-09-21 19:00:59','2026-09-21 19:00:59');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('cb6e5551-bdd9-425b-ad43-9256fd1f9e83','Precious Elijah','plijjjjjh794@gmail.com',NULL,NULL,'7c4106737b71c994004dee34cf3ee1f990efcb0234e41bd5fbf8cb9dd3d25348','2026-09-21 19:04:15','2026-09-21 19:04:15');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('37ad9172-2c53-48a0-a16b-24724a7dd2a7','nnc','djjj@gmail.com',NULL,NULL,'b70418b3652d41515baaebf661a32c9d657fbd5980672eadf7970353bab2a021','2026-09-21 19:05:35','2026-09-21 19:05:35');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('b7d08183-e626-4237-8d61-20b3f8ae04b1','mm','mfmfmmfmf@gmail.com',NULL,NULL,'d16828ade7126a894c1cac95ff104588bf40c5957ba5952ed2a13d99c08d4b6c','2026-09-21 19:08:09','2026-09-21 19:08:09');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('092ae385-7046-49d8-84de-3bbde7b25635','mm','mfmmfmf@gmail.com',NULL,NULL,'bcf1c7f166fc31b21b3dd018c1501245939bfb2b9d5ce54e2c22adb0bd65d174','2026-09-21 19:14:33','2026-09-21 19:14:33');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('f27f7b67-0831-42af-8f97-397c23345cef','Backend Test','backendtest201823@example.com','Test Business','https://example.com','0c190588744549d905108b2b0627d7dd2e9e004d0e956619495c87bf474d4f92','2026-09-21 19:16:56','2026-09-21 19:16:56');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('85d4dccb-2c42-4681-857d-86713f3361d4','Backend Test','backendtest201959@example.com','Test Business','https://example.com','d49f5541ad70bb6a440b90a3ce73fe0022cb7f303a77fdac91a08c0724625f4c','2026-09-21 19:18:30','2026-09-21 19:18:30');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('12a31110-a772-442f-8026-2b077c6f1f4a','nc','jjd@gmail.com',NULL,NULL,'4e57ad5041b45b45d8fd00fd7c7d32dc364591bd7b46faa89f520264c7184786','2026-09-21 19:23:37','2026-09-21 19:23:37');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('556c9cab-d025-47af-a93d-fc3fbbc01117','Backend Test','backendtest202620@example.com',NULL,'https://example.com','d7d94a41d98f7efe9c6b7d4a54dc833a551d5335241fabed0213072065c364e6','2026-09-21 19:24:52','2026-09-21 19:24:52');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('d51072db-ec6b-4ee3-8980-144fd358db74','Precious Osason','preciouason@gmail.com',NULL,NULL,'6797a8ccf76729ad49175a682756983608c8615b8c54ed7c7eaa43b639a2a760','2026-09-21 19:29:42','2026-09-21 19:29:42');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('bc54c787-bb09-41cb-a76c-8db6c73b531e','mm','hhdhhdddd@gmail.com',NULL,NULL,'9de6dc6bca9b9b64ba49d24855e715a78b8d51557d3927fd92b74b8901ceb387','2026-09-21 19:39:41','2026-09-21 19:39:41');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('cb618dca-33de-4540-9e38-02e4666430fa','ELIJAH PRECIOUS OSAGIE','preciouselih794@gmail.com','Hunter','https://hi.com','1c40309a42790aff4ea377796f8652a635e7a3680ea97c48cab8998efec445c7','2026-09-21 20:34:50','2026-09-21 20:34:50');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('222d5fa2-8efa-475f-aba6-18c3b466ab68','Precious Elijah','precio.useli.jah794@gmail.com',NULL,NULL,'3e6e2de3ef130d4d57ac0439a7e84e41d5bdaee479707107af6077856af61651','2026-09-22 07:23:22','2026-09-22 07:23:22');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('8eed239f-8957-4c1e-8bf4-b4294c2305ee','Precious Osason','preciousonnnnnnsason@gmail.com',NULL,NULL,'2959abb5df89c833857a6f8d4eabd6a25abade6c050a5b797f4054e6a3fda582','2026-09-22 12:24:47','2026-09-22 12:24:47');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('74f4a4d5-e8df-49f8-81fd-87ebde5153e4','f h','pp@gmail.com',NULL,NULL,'56c2dd88016d57a222855ea20ff07d8d452aafbe2aa077a6f2cf138a051e46af','2026-09-22 14:26:54','2026-09-22 14:26:54');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('18e853af-d735-4c3e-a159-92c5754507c2','Precious Elijah','preciouselijjjejeh794@gmail.com',NULL,NULL,'c2010c6a0644ebe61f334999d34f2db50231cc3701c33406ed2f4aa29a9e43ea','2026-09-22 14:52:40','2026-09-22 14:52:40');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('e9c04555-4d35-4a4a-a550-c11fc9a7364d','Michael Adamson','michaeladamson100@gmail.com','Michael Adams','https://michaeladams.com','f2f3af35f6a23f8531dd75613b2c476626f42064bdaedd9ed1de689c0b506a31','2026-09-22 15:30:03','2026-09-22 15:30:03');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('7f1b5a84-52b3-4932-946f-3b4df33100b1','Precious Elijah','preciousuieueejelijah794@gmail.com',NULL,NULL,'f488116bf9707302369be10ea760a156cd013937e7f4853780079fbaa9dcfe59','2026-09-23 20:29:28','2026-09-23 20:29:28');
INSERT INTO "clients" ("id","name","email","business","website","token_hash","created_at","updated_at") VALUES('6c4a0167-ef5d-4848-bbed-3e44de767f97','Soyemi Oluwatofarati joel Soyemi','joel.soyemi@gmail.com','Dev',NULL,'135ed86f1381d11f9e3b66c12afd1de7549de3b37eb83d22c4703fbc1905324d','2026-09-27 08:05:12','2026-09-27 08:05:12');
CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT 'Leak Hunt Investigation',
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE CASCADE
);
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('8e9c9b90-92f7-489b-9d3f-6d724c65babd','c0fb68da-cf70-489b-a646-f46cd5b95c2c','Leak Hunt Investigation','open','2026-09-21 17:58:06','2026-09-21 17:58:06');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('1c53458d-38be-4e95-bdd4-2d8a271bc505','0239ec67-5741-4fd8-a9dd-cf80f3858b5f','Leak Hunt Investigation','open','2026-09-21 18:01:27','2026-09-21 18:01:27');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('cad6fba8-72a2-42a9-8e84-b99d92e6caf3','1fb0d873-d252-41f5-b176-380032af1e5c','Leak Hunt Investigation','open','2026-09-21 18:05:33','2026-09-21 18:05:33');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('b3bedd00-4a0c-4161-86f5-b5ca971b95ec','af09495c-f665-410b-9417-18bdf6a671c8','Leak Hunt Investigation','open','2026-09-21 18:07:13','2026-09-21 18:07:13');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('c2fe4870-175b-48f8-8e4d-553b1ea420cd','456b8411-0bfc-47d0-a807-66d5a717c53e','Leak Hunt Investigation','open','2026-09-21 18:14:45','2026-09-21 18:14:45');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('99e8cc9b-7b70-49e5-bfbb-201aabd808d3','67ec3ecd-4763-49fb-b9c2-a283eb14b32d','Leak Hunt Investigation','open','2026-09-21 18:16:27','2026-09-21 18:16:27');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('d22050a7-3ef7-43be-8589-05c3964acddb','198e3d02-a366-4df5-8005-85ae9b6333c5','Leak Hunt Investigation','open','2026-09-21 18:26:29','2026-09-21 18:26:29');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('41fab619-0b6d-41ec-9ca8-252b37729c25','ff27d8ba-a9e4-4a99-8d08-26d6ac62e3f4','Leak Hunt Investigation','open','2026-09-21 18:31:41','2026-09-21 18:31:41');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('460d5fcc-b38b-44e3-8477-f5364dc79cd2','6697b9d5-f428-4f45-bae3-367ca26ee5cc','Leak Hunt Investigation','open','2026-09-21 19:00:59','2026-09-21 19:00:59');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('d8a252ca-9aae-43fd-ae2b-540245420c6d','cb6e5551-bdd9-425b-ad43-9256fd1f9e83','Leak Hunt Investigation','open','2026-09-21 19:04:16','2026-09-21 19:04:16');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('da157367-4fc4-4cb6-8303-09a60db639b9','37ad9172-2c53-48a0-a16b-24724a7dd2a7','Leak Hunt Investigation','open','2026-09-21 19:05:35','2026-09-21 19:05:35');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('c16dd5b2-cce9-4b46-97a4-04c87c2aed7f','b7d08183-e626-4237-8d61-20b3f8ae04b1','Leak Hunt Investigation','open','2026-09-21 19:08:09','2026-09-21 19:08:09');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('426c51ba-77a3-4d78-aeb5-9bb9dc5effab','092ae385-7046-49d8-84de-3bbde7b25635','Leak Hunt Investigation','open','2026-09-21 19:14:33','2026-09-21 19:14:33');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('afb69724-afb1-4689-a29e-a35a51c6a28d','f27f7b67-0831-42af-8f97-397c23345cef','Leak Hunt Investigation','open','2026-09-21 19:16:56','2026-09-21 19:16:56');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('0ce3cd5f-1494-464f-ab18-002bd92015cb','85d4dccb-2c42-4681-857d-86713f3361d4','Leak Hunt Investigation','open','2026-09-21 19:18:30','2026-09-21 19:18:30');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('26c322fb-764a-42c1-b148-3ab28cad3d3a','12a31110-a772-442f-8026-2b077c6f1f4a','Leak Hunt Investigation','open','2026-09-21 19:23:38','2026-09-21 19:23:38');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('70e6d3c3-6ae8-4634-ad2b-69b2ed758471','556c9cab-d025-47af-a93d-fc3fbbc01117','Leak Hunt Investigation','open','2026-09-21 19:24:52','2026-09-21 19:24:52');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('5cb47fa6-2a82-41fe-9e73-9d14c607b862','d51072db-ec6b-4ee3-8980-144fd358db74','Leak Hunt Investigation','open','2026-09-21 19:29:42','2026-09-25 12:57:13');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('cf6802a7-cb24-4700-9d7f-7ae69952070a','bc54c787-bb09-41cb-a76c-8db6c73b531e','Leak Hunt Investigation','open','2026-09-21 19:39:42','2026-09-21 20:27:03');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('74c0c1c1-4165-4038-af69-09579c115004','cb618dca-33de-4540-9e38-02e4666430fa','Leak Hunt Investigation','open','2026-09-21 20:34:50','2026-09-21 20:36:58');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('ccec026e-6858-4fe4-946d-a5a5c4c2a4f4','222d5fa2-8efa-475f-aba6-18c3b466ab68','Leak Hunt Investigation','open','2026-09-22 07:23:22','2026-09-22 07:23:22');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('0e081c1d-1d60-4d88-93d4-16ba7d578513','8eed239f-8957-4c1e-8bf4-b4294c2305ee','Leak Hunt Investigation','open','2026-09-22 12:24:47','2026-09-22 14:23:36');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('02bcd736-2d3b-4b84-95a6-89d52ac8d7b9','74f4a4d5-e8df-49f8-81fd-87ebde5153e4','Leak Hunt Investigation','open','2026-09-22 14:26:54','2026-09-22 14:36:19');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('e8e5e68d-7b6a-422b-907d-d373422d683e','18e853af-d735-4c3e-a159-92c5754507c2','Leak Hunt Investigation','open','2026-09-22 14:52:40','2026-09-22 14:55:55');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('1999fab9-0f2e-4e7d-913d-f23fc48c5a2b','e9c04555-4d35-4a4a-a550-c11fc9a7364d','Leak Hunt Investigation','open','2026-09-22 15:30:04','2026-09-24 07:43:34');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('d61db155-822b-4faf-b39c-4ec126e6fd25','7f1b5a84-52b3-4932-946f-3b4df33100b1','Leak Hunt Investigation','open','2026-09-23 20:29:28','2026-09-29 11:28:57');
INSERT INTO "conversations" ("id","client_id","subject","status","created_at","updated_at") VALUES('5e9f9a12-113f-49e6-bd3a-ce2d2ab77a0f','6c4a0167-ef5d-4848-bbed-3e44de767f97','Leak Hunt Investigation','open','2026-09-27 08:05:12','2026-09-27 08:11:01');
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_type TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE
);
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('748e96a2-b674-466c-9849-c8dcfc4848cd','8e9c9b90-92f7-489b-9d3f-6d724c65babd','client',replace('Business: Jsjsj\nWebsite: https://re.com\nWhat they sell: Hhsjs\nSuspected leak: customer-journey\n\nClient message:\nJsjs','\n',char(10)),'2026-09-21 17:58:06');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('d68b8868-0b98-4291-9802-9854352a74fd','1c53458d-38be-4e95-bdd4-2d8a271bc505','client',replace('Business: Jeej\nWebsite: https://hi.com\nWhat they sell: Nsnsn\nSuspected leak: unknown\n\nClient message:\nZnznzn','\n',char(10)),'2026-09-21 18:01:27');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('9d04cecd-04b0-40e2-be31-689c94f8a35f','cad6fba8-72a2-42a9-8e84-b99d92e6caf3','client',replace('Business: Ndnnd\nWebsite: https://hi.com\nWhat they sell: Z snsn\nSuspected leak: funnel\n\nClient message:\nNsnns','\n',char(10)),'2026-09-21 18:05:33');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('6d3ea187-dbfe-40a2-a96d-498aba4155dc','b3bedd00-4a0c-4161-86f5-b5ca971b95ec','client',replace('Business: mmd\nWebsite: http://we.com\nWhat they sell: nnnc\nSuspected leak: leads\n\nClient message:\nncnc','\n',char(10)),'2026-09-21 18:07:13');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('77741ca7-7637-420f-8e99-581ef9c9f004','c2fe4870-175b-48f8-8e4d-553b1ea420cd','client',replace('Business: Ndnnd\nWebsite: https://hi.com\nWhat they sell: Z snsn\nSuspected leak: funnel\n\nClient message:\nNsnns','\n',char(10)),'2026-09-21 18:14:45');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('1e195f7a-54be-4a9e-9349-f01364624105','99e8cc9b-7b70-49e5-bfbb-201aabd808d3','client',replace('Business: Hwjaj\nWebsite: Not provided\nWhat they sell: Jjwjwwj\nSuspected leak: funnel\n\nClient message:\nNo additional message provided.','\n',char(10)),'2026-09-21 18:16:27');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('1c5c62b5-4dc6-4d44-9f49-de3ef68a4d3c','d22050a7-3ef7-43be-8589-05c3964acddb','client',replace('Business: Not provided\nWebsite: Not provided\nWhat they sell: Jjeje\nSuspected leak: funnel\n\nClient message:\nNo additional message provided.','\n',char(10)),'2026-09-21 18:26:29');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('496bf6c5-39b0-4426-a525-0b489c6f0130','41fab619-0b6d-41ec-9ca8-252b37729c25','client',replace('Business: Not provided\nWebsite: Not provided\nWhat they sell: Bnbn\nSuspected leak: leads\n\nClient message:\nNo additional message provided.','\n',char(10)),'2026-09-21 18:31:41');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('738ae58d-a9de-4863-b3de-de9bb5bb8ba5','460d5fcc-b38b-44e3-8477-f5364dc79cd2','client',replace('Business: Not provided\nWebsite: Not provided\nWhat they sell: vvjjv\nSuspected leak: messaging\n\nClient message:\nNo additional message provided.','\n',char(10)),'2026-09-21 19:00:59');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('875a683b-6b6a-4e7c-b091-88b1d4aab441','d8a252ca-9aae-43fd-ae2b-540245420c6d','client',replace('Business: Not provided\nWebsite: Not provided\nWhat they sell: Bnbn\nSuspected leak: leads\n\nClient message:\nNo additional message provided.','\n',char(10)),'2026-09-21 19:04:16');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('4ed97486-026e-46fa-9207-f24240110bac','da157367-4fc4-4cb6-8303-09a60db639b9','client',replace('Business: Not provided\nWebsite: Not provided\nWhat they sell: vvjjv\nSuspected leak: messaging\n\nClient message:\nNo additional message provided.','\n',char(10)),'2026-09-21 19:05:35');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('1e7c9eb6-a52a-4023-a981-50e089b16f8d','c16dd5b2-cce9-4b46-97a4-04c87c2aed7f','client',replace('Business: Not provided\nWebsite: Not provided\nWhat they sell: mmm\nSuspected leak: customer-journey\n\nClient message:\nNo additional message provided.','\n',char(10)),'2026-09-21 19:08:09');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('85692c25-12b0-46ad-8d52-aa12375ef672','426c51ba-77a3-4d78-aeb5-9bb9dc5effab','client',replace('Business: Not provided\nWebsite: Not provided\nWhat they sell: mmm\nSuspected leak: customer-journey\n\nClient message:\nNo additional message provided.','\n',char(10)),'2026-09-21 19:14:33');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('7f4772c3-b4a2-44c2-9e68-16a7dbbf60d2','afb69724-afb1-4689-a29e-a35a51c6a28d','client',replace('Business: Test Business\nWebsite: https://example.com\nWhat they sell: Digital marketing\nSuspected leak: Website\n\nClient message:\nTesting backend response','\n',char(10)),'2026-09-21 19:16:56');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('f1592df1-11d5-46fe-991d-788e876da17f','0ce3cd5f-1494-464f-ab18-002bd92015cb','client',replace('Business: Test Business\nWebsite: https://example.com\nWhat they sell: Digital marketing\nSuspected leak: Website\n\nClient message:\nTesting backend response','\n',char(10)),'2026-09-21 19:18:30');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('190e7395-260c-406c-8eb6-5473c7da0c96','26c322fb-764a-42c1-b148-3ab28cad3d3a','client',replace('Business: Not provided\nWebsite: Not provided\nWhat they sell: nnn\nSuspected leak: funnel\n\nClient message:\nNo additional message provided.','\n',char(10)),'2026-09-21 19:23:38');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('7668b7f3-4ed3-46e5-9049-e28d991029d1','70e6d3c3-6ae8-4634-ad2b-69b2ed758471','client',replace('Business: Not provided\nWebsite: https://example.com\nWhat they sell: Digital marketing\nSuspected leak: Website\n\nClient message:\nTesting backend response','\n',char(10)),'2026-09-21 19:24:52');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('58cb826a-22b4-48f7-94d6-05cda0e3a628','5cb47fa6-2a82-41fe-9e73-9d14c607b862','client',replace('Business: Not provided\nWebsite: Not provided\nWhat they sell: nnn\nSuspected leak: customer-journey\n\nClient message:\nNo additional message provided.','\n',char(10)),'2026-09-21 19:29:42');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('7cfd8992-a158-4cd4-ae3e-91bf7c18dc64','cf6802a7-cb24-4700-9d7f-7ae69952070a','client',replace('Business: Not provided\nWebsite: Not provided\nWhat they sell: nnkkffkfk kfkfk\nSuspected leak: customer-journey\n\nClient message:\nNo additional message provided.','\n',char(10)),'2026-09-21 19:39:42');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('8ae2a168-ec28-4b4d-bb2b-d831c4e0c032','cf6802a7-cb24-4700-9d7f-7ae69952070a','client','what','2026-09-21 20:01:37');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('5f78c0d9-cabf-46f3-8d74-6124c0ff85c0','cf6802a7-cb24-4700-9d7f-7ae69952070a','client','i love you','2026-09-21 20:01:47');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('0d799d40-e133-443f-9aed-44c10e63bf35','cf6802a7-cb24-4700-9d7f-7ae69952070a','admin','ok','2026-09-21 20:27:03');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('e4da21f8-883c-46bd-87ed-985520d4bdff','74c0c1c1-4165-4038-af69-09579c115004','client',replace('Business: Hunter\nWebsite: https://hi.com\nWhat they sell: Books\nSuspected leak: funnel\n\nClient message:\nNo sales','\n',char(10)),'2026-09-21 20:34:50');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('ec747447-16d8-48f1-83bb-d727213b0067','74c0c1c1-4165-4038-af69-09579c115004','client','Hi leak hunter','2026-09-21 20:36:30');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('515c8009-7732-4ba1-b760-1d00a9887896','74c0c1c1-4165-4038-af69-09579c115004','admin','Hello Precious','2026-09-21 20:36:58');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('b8b07e47-7869-4fd9-904a-e688e9a3a02f','ccec026e-6858-4fe4-946d-a5a5c4c2a4f4','client',replace('Business: Not provided\nWebsite: Not provided\nWhat they sell: Jjeje rjr\nSuspected leak: messaging\n\nClient message:\nHshs','\n',char(10)),'2026-09-22 07:23:22');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('ea69e61b-ea97-4ab5-9e4a-0ac9833ff822','0e081c1d-1d60-4d88-93d4-16ba7d578513','client',replace('Business: Not provided\nWebsite: Not provided\nWhat they sell: mm gb\nSuspected leak: funnel\n\nClient message:\nmmmm','\n',char(10)),'2026-09-22 12:24:47');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('fca0b6e0-d141-4f66-b976-3726fd29ea2c','0e081c1d-1d60-4d88-93d4-16ba7d578513','client','hey','2026-09-22 12:25:04');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('6ae72f10-30ae-4fac-b42d-06deae6eb2e5','0e081c1d-1d60-4d88-93d4-16ba7d578513','admin','what is up','2026-09-22 12:25:22');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('01d38a75-14bb-4ddd-9b26-4ed542440103','0e081c1d-1d60-4d88-93d4-16ba7d578513','admin','i need you to help me work on this shit','2026-09-22 12:25:47');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('438b6062-ce42-4a61-af92-ac0cc5ff98a7','0e081c1d-1d60-4d88-93d4-16ba7d578513','client','i need yu t he hte','2026-09-22 12:26:10');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('e93acfae-87b5-4b61-9334-ee0176e09fce','0e081c1d-1d60-4d88-93d4-16ba7d578513','admin','ok then, www.amazon.com','2026-09-22 12:26:49');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('19816e18-9654-4673-b57c-1258358079e5','0e081c1d-1d60-4d88-93d4-16ba7d578513','client','www.amazon.com','2026-09-22 12:42:07');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('e7a5e8d3-1d41-4e1f-8220-7957a47195c9','0e081c1d-1d60-4d88-93d4-16ba7d578513','client','www.amazon.com','2026-09-22 12:42:58');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('adbcf6c5-88a4-4d84-98df-8b634fe091e5','0e081c1d-1d60-4d88-93d4-16ba7d578513','client','https://amazon.com','2026-09-22 12:43:16');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('1eceb481-8995-403c-ac52-b4d62bf9fae9','0e081c1d-1d60-4d88-93d4-16ba7d578513','client','www.amazon.com','2026-09-22 12:50:38');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('294fd81b-6aed-42b4-bd25-43042748b19b','0e081c1d-1d60-4d88-93d4-16ba7d578513','client','ok','2026-09-22 14:18:10');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('ef9bb264-21b4-434b-a4e9-2075821b0fac','0e081c1d-1d60-4d88-93d4-16ba7d578513','client','ok','2026-09-22 14:18:12');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('b727d107-7019-45e8-99ec-8a591aacbb81','0e081c1d-1d60-4d88-93d4-16ba7d578513','client','he','2026-09-22 14:23:36');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('d95c57ac-7f36-4e10-8081-b91ae10fbcc5','02bcd736-2d3b-4b84-95a6-89d52ac8d7b9','client',replace('Business: Not provided\nWebsite: Not provided\nWhat they sell: md ok\nSuspected leak: leads\n\nClient message:\nmx','\n',char(10)),'2026-09-22 14:26:54');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('59140aab-847d-49df-88c0-d1ad1ce42feb','02bcd736-2d3b-4b84-95a6-89d52ac8d7b9','client','hello','2026-09-22 14:27:18');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('f150e49c-fefe-4bf4-b627-debd002c51f0','02bcd736-2d3b-4b84-95a6-89d52ac8d7b9','admin','hi bro, here is the file','2026-09-22 14:36:17');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('e13f33d2-4b66-418a-b1e4-576d3be8f1cc','e8e5e68d-7b6a-422b-907d-d373422d683e','client',replace('Business: Not provided\nWebsite: Not provided\nWhat they sell: The bro\nSuspected leak: messaging\n\nClient message:\nIssksk ejen','\n',char(10)),'2026-09-22 14:52:40');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('e62ce61b-d724-44c9-944c-c20b16f146e9','e8e5e68d-7b6a-422b-907d-d373422d683e','client','Hello Lodd','2026-09-22 14:53:03');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('46abbb2d-556a-4bfe-bf02-4857653d64ea','e8e5e68d-7b6a-422b-907d-d373422d683e','admin','how far na bro','2026-09-22 14:54:02');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('e482c6c6-d158-446c-9d98-5fd005629ef7','e8e5e68d-7b6a-422b-907d-d373422d683e','client','You fit help me with my website?','2026-09-22 14:54:18');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('483d622e-e106-4fe1-b3e4-7af44e9ca5f3','e8e5e68d-7b6a-422b-907d-d373422d683e','admin','for sure, send file','2026-09-22 14:54:33');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('fed201a2-c02c-4c9d-bdc3-367b0ad5335c','e8e5e68d-7b6a-422b-907d-d373422d683e','client','Ok','2026-09-22 14:54:40');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('6b607f74-0b9f-4842-9dc7-623e364043ce','e8e5e68d-7b6a-422b-907d-d373422d683e','client','Here is it','2026-09-22 14:55:13');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('0371295e-babc-41da-8e93-b523cee9db7f','e8e5e68d-7b6a-422b-907d-d373422d683e','admin','oya na, tnk, we will go through it','2026-09-22 14:55:51');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('ff636705-121c-41ff-a666-bd9c1dd99ae8','1999fab9-0f2e-4e7d-913d-f23fc48c5a2b','client',replace('Business: Michael Adams\nWebsite: https://michaeladams.com\nWhat they sell: Writing Services\nSuspected leak: unknown\n\nClient message:\nJust Interested','\n',char(10)),'2026-09-22 15:30:04');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('b35acd33-caf0-436b-9173-8c894ed062ff','1999fab9-0f2e-4e7d-913d-f23fc48c5a2b','client','Yooo, let''s investigate','2026-09-22 15:32:51');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('63f53400-04a2-4997-9ccc-59549ef3cea3','1999fab9-0f2e-4e7d-913d-f23fc48c5a2b','admin','investigation process brought zero issue on my end, reply if you receive this and the attached file','2026-09-22 15:35:06');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('35337802-07ab-4755-9057-89968f92b34b','1999fab9-0f2e-4e7d-913d-f23fc48c5a2b','admin','.','2026-09-22 15:39:40');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('4354b606-c69a-4574-906b-083c0f67c2c6','1999fab9-0f2e-4e7d-913d-f23fc48c5a2b','admin','i remembered you wrote that pdf','2026-09-22 15:40:17');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('575857cd-b5f0-453a-8db5-19eacbf1b2c7','1999fab9-0f2e-4e7d-913d-f23fc48c5a2b','client','Yeah thank you Brother','2026-09-22 16:44:45');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('a6476e7b-bb2d-4614-ab0a-65f50aaa34cd','d61db155-822b-4faf-b39c-4ec126e6fd25','client',replace('Business: Not provided\nWebsite: Not provided\nWhat they sell: The\nSuspected leak: customer-journey\n\nClient message:\nOk th','\n',char(10)),'2026-09-23 20:29:28');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('1999073d-aae8-4c95-a651-826066b387c7','d61db155-822b-4faf-b39c-4ec126e6fd25','client','Hi','2026-09-23 20:29:47');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('e8a0cf69-0dc2-4ecb-8df2-7b85724ff419','d61db155-822b-4faf-b39c-4ec126e6fd25','admin','what is up','2026-09-23 20:31:00');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('2307810d-e633-4791-8bb0-2c4b06e65739','d61db155-822b-4faf-b39c-4ec126e6fd25','admin','im good and you','2026-09-23 20:31:13');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('847eeece-4419-4ac5-9a7e-73cf274c8b81','d61db155-822b-4faf-b39c-4ec126e6fd25','client','Fine','2026-09-23 20:31:24');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('72413cca-315e-419c-9bd3-cc41c18de176','d61db155-822b-4faf-b39c-4ec126e6fd25','client',replace('👉🏿👇🏿👇🏿👇🏿👇🏿👇🏿👇🏿👇🏿👇🏿👇🏿👈🏿\n👉🏿👇🏾👇🏾👇🏾👇🏾👇🏾👇🏾👇🏾👇🏾👇🏾👈🏿\n👉🏿👉🏾👇🏽👇🏽👇🏽👇🏽👇🏽👇🏽👇🏽👈🏾👈🏿\n👉🏿👉🏾👉🏽👇🏼👇🏼👇🏼👇🏼👇🏼👈🏽👈🏾👈🏿\n👉🏿👉🏾👉🏽👉🏼👇🏻👇🏻👇🏻👈🏼👈🏽👈🏾👈🏿\n👉🏿👉🏾👉🏽👉🏼👉🏻🖕👈🏻👈🏼👈🏽👈🏾👈🏿\n👉🏿👉🏾👉🏽👉🏼👆🏻👆🏻👆🏻👈🏼👈🏽👈🏾👈🏿\n👉🏿👉🏾👉🏽👆🏼👆🏼👆🏼👆🏼👆🏼👈🏽👈🏾👈🏿\n👉🏿👉🏾👆🏽👆🏽👆🏽👆🏽👆🏽👆🏽👆🏽👈🏾👈🏿\n👉🏿👆🏾👆🏾👆🏾👆🏾👆🏾👆🏾👆🏾👆🏾👆🏾👈🏿\n👉🏿👆🏿👆🏿👆🏿👆🏿👆🏿👆🏿👆🏿👆🏿👆🏿👈🏿','\n',char(10)),'2026-09-24 07:37:13');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('92b8a043-8263-4ede-8dc9-9cfa9b8161c8','d61db155-822b-4faf-b39c-4ec126e6fd25','client','not funny. didnt laugh. not even a single giggle. not a single haha. not even a hehe. not a sound. not at all funny. i did not even feel like laughing one bit. i didn’t let out even a chuckle. not even a subtle burst of air out of my esophagus.','2026-09-24 07:37:32');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('3702fcce-8d2b-46d9-b4d5-9c37031d6fdc','d61db155-822b-4faf-b39c-4ec126e6fd25','client',replace('***************\n        😑\n     /  ) )`\ \n 🗡 (  !    🔪\n       !  \     \n      👢👢\n*Where is the Admin!!!*\n\n*The month has  ended & every Group has received their own Salary, where is ours? 🙄☹️*\n\n\n*WHO CREATED THIS GROUP*???🙄🤪😅😅😅🏃‍♀️🏃‍♀️🏃‍♀️🏃‍♀️🏃‍♀️','\n',char(10)),'2026-09-24 07:37:47');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('71ef3a4e-f119-43dc-865c-517bffac782a','1999fab9-0f2e-4e7d-913d-f23fc48c5a2b','admin',replace('If I lost my life,I think I''d pretty much still be better than you are?\n\nYou''re just something God tested as a premium failure.\n\nHe wanted to see how much of a flaw he can produce.','\n',char(10)),'2026-09-24 07:40:16');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('91896b1c-a91a-44c6-8093-aa78a8182ebe','1999fab9-0f2e-4e7d-913d-f23fc48c5a2b','admin','Bro sorry, abeg. Na msitake','2026-09-24 07:43:34');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('d35d4f67-efba-4be9-9b83-744abc1ca052','d61db155-822b-4faf-b39c-4ec126e6fd25','admin',replace('The day it was raining knowledge,you was covering up yourself with self deceit.\n\nPeople like you are the reason why AI think they are very smart.😂😂','\n',char(10)),'2026-09-24 07:45:47');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('9e1bddac-4efa-4a98-9be6-11f7f2a516f9','5cb47fa6-2a82-41fe-9e73-9d14c607b862','client','hey man , what is up','2026-09-25 12:56:47');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('01192306-d447-4834-baea-dbd9fcc4d741','5cb47fa6-2a82-41fe-9e73-9d14c607b862','admin','yo yo o, im good','2026-09-25 12:57:12');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('0d6d6761-83f8-4693-8e5e-4bdb340bc972','5e9f9a12-113f-49e6-bd3a-ce2d2ab77a0f','client',replace('Business: Dev\nWebsite: Not provided\nWhat they sell: Today is Friday everybody like it la la la la la\nSuspected leak: funnel\n\nClient message:\nNo additional message provided.','\n',char(10)),'2026-09-27 08:05:12');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('ac4f00bd-08a3-4ecc-a186-b398a0276e5e','5e9f9a12-113f-49e6-bd3a-ce2d2ab77a0f','client','How u doing bro, I think the token is working, but I didn''t get it through my mail it sent it as a message on the site','2026-09-27 08:06:38');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('df5e462e-4751-4595-8858-77c65c10f951','5e9f9a12-113f-49e6-bd3a-ce2d2ab77a0f','admin','yes, na because sey I never buy professional email.','2026-09-27 08:11:00');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('45271f17-022f-488a-af49-1a8054bbaea1','d61db155-822b-4faf-b39c-4ec126e6fd25','client','Hey','2026-09-29 10:41:07');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('0c243d25-4920-4ac9-977a-a9019b75f201','d61db155-822b-4faf-b39c-4ec126e6fd25','admin','ok','2026-09-29 10:41:23');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('09dde21e-bf05-4b49-a202-bf9dd6acfaca','d61db155-822b-4faf-b39c-4ec126e6fd25','client','Nice bro','2026-09-29 10:41:53');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('a9378262-36f2-4c35-9e0b-9df9f73a86ca','d61db155-822b-4faf-b39c-4ec126e6fd25','client','Ah','2026-09-29 10:42:24');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('68ff9214-a49f-4d5d-92fd-05817d2d70cc','d61db155-822b-4faf-b39c-4ec126e6fd25','client','7','2026-09-29 10:42:51');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('00f28db9-ecdf-451a-8a7e-0ef3247f597c','d61db155-822b-4faf-b39c-4ec126e6fd25','admin','h','2026-09-29 10:43:31');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('1f3f2937-2d86-41e8-a9e1-4df078ca4c62','d61db155-822b-4faf-b39c-4ec126e6fd25','client','H','2026-09-29 10:50:08');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('77943daf-38f4-4f78-a79a-fbe302790ede','d61db155-822b-4faf-b39c-4ec126e6fd25','admin','j','2026-09-29 11:09:03');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('73842547-dd68-4a3e-84a2-4a768e55da2a','d61db155-822b-4faf-b39c-4ec126e6fd25','admin','j','2026-09-29 11:13:03');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('2e15c46b-2057-463d-b09b-4d839f464190','d61db155-822b-4faf-b39c-4ec126e6fd25','admin','j','2026-09-29 11:17:52');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('017aaded-da0f-4e0f-b09b-3ef13009cbc4','d61db155-822b-4faf-b39c-4ec126e6fd25','admin','hi','2026-09-29 11:18:36');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('aba771dd-e314-4874-bb01-f4a7cd28cdf6','d61db155-822b-4faf-b39c-4ec126e6fd25','admin','hey','2026-09-29 11:19:41');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('edb18b8c-f658-4ad8-beac-ff194d70a617','d61db155-822b-4faf-b39c-4ec126e6fd25','admin','hi','2026-09-29 11:25:29');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('a6e3ed4e-36d7-406d-9f28-f44608e5ec80','d61db155-822b-4faf-b39c-4ec126e6fd25','admin','hi','2026-09-29 11:26:55');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('22a3d17d-7a41-44a2-ba81-e6a3c568c83c','d61db155-822b-4faf-b39c-4ec126e6fd25','admin','hi','2026-09-29 11:28:25');
INSERT INTO "messages" ("id","conversation_id","sender_type","message","created_at") VALUES('8d381be4-7828-4e0f-8ca9-158acff6a1c2','d61db155-822b-4faf-b39c-4ec126e6fd25','client','Ok','2026-09-29 11:28:56');
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE CASCADE
);
INSERT INTO "sessions" ("id","client_id","expires_at","created_at") VALUES('6a28d1fe-d343-477f-8dc8-4b80047026d4','bc54c787-bb09-41cb-a76c-8db6c73b531e','2026-09-28T19:57:15.341Z','2026-09-21 19:57:15');
INSERT INTO "sessions" ("id","client_id","expires_at","created_at") VALUES('4e593f01-94c3-4a08-a0bf-85d5350f5761','8eed239f-8957-4c1e-8bf4-b4294c2305ee','2026-09-29T12:24:56.785Z','2026-09-22 12:24:56');
INSERT INTO "sessions" ("id","client_id","expires_at","created_at") VALUES('d44ae6ba-e94b-443f-a0fd-cd401ec7ea31','8eed239f-8957-4c1e-8bf4-b4294c2305ee','2026-09-29T12:41:49.047Z','2026-09-22 12:41:49');
INSERT INTO "sessions" ("id","client_id","expires_at","created_at") VALUES('128c15bd-3129-441f-b001-a1b624afb8a5','8eed239f-8957-4c1e-8bf4-b4294c2305ee','2026-09-29T12:42:47.295Z','2026-09-22 12:42:47');
INSERT INTO "sessions" ("id","client_id","expires_at","created_at") VALUES('92234a7f-2613-44d9-bcc3-e79d2e534e9a','74f4a4d5-e8df-49f8-81fd-87ebde5153e4','2026-09-29T14:27:02.215Z','2026-09-22 14:27:02');
INSERT INTO "sessions" ("id","client_id","expires_at","created_at") VALUES('19ed054d-ea03-4302-a32a-9ddd59c31b8e','18e853af-d735-4c3e-a159-92c5754507c2','2026-09-29T14:52:44.509Z','2026-09-22 14:52:44');
INSERT INTO "sessions" ("id","client_id","expires_at","created_at") VALUES('5fd2dbc0-d003-4b51-ad02-b74e71d5784b','e9c04555-4d35-4a4a-a550-c11fc9a7364d','2026-09-29T15:30:23.547Z','2026-09-22 15:30:23');
INSERT INTO "sessions" ("id","client_id","expires_at","created_at") VALUES('69b5fa67-4a4b-4d3c-b253-404b22497292','74f4a4d5-e8df-49f8-81fd-87ebde5153e4','2026-09-30T12:24:00.151Z','2026-09-23 12:24:00');
INSERT INTO "sessions" ("id","client_id","expires_at","created_at") VALUES('905038ec-3cc3-4eb1-a8c0-becba28f1974','7f1b5a84-52b3-4932-946f-3b4df33100b1','2026-10-01T07:35:41.920Z','2026-09-24 07:35:41');
INSERT INTO "sessions" ("id","client_id","expires_at","created_at") VALUES('c163951d-b82e-489e-a036-6a24616fbca2','d51072db-ec6b-4ee3-8980-144fd358db74','2026-10-02T16:18:39.991Z','2026-09-25 16:18:39');
INSERT INTO "sessions" ("id","client_id","expires_at","created_at") VALUES('fb52e049-9e54-4eed-9419-5142ce719404','6c4a0167-ef5d-4848-bbed-3e44de767f97','2026-10-04T08:05:24.191Z','2026-09-27 08:05:24');
INSERT INTO "sessions" ("id","client_id","expires_at","created_at") VALUES('27dae9a6-d43e-4e52-aeab-609a0f45459e','7f1b5a84-52b3-4932-946f-3b4df33100b1','2026-10-06T10:40:58.161Z','2026-09-29 10:40:58');
CREATE TABLE reviews (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    name TEXT NOT NULL,
    business TEXT,
    rating INTEGER,
    review TEXT NOT NULL,
    approved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE SET NULL
);
INSERT INTO "reviews" ("id","client_id","name","business","rating","review","approved","created_at") VALUES('e15a0455-605a-43b8-ae54-5c276ca8b38d',NULL,'Aisha Williams','Wellness Brand',5,'I spent thousands of dollars to make the website looked good, but I almsot gave up becuase it wasn’t moving people to take action. But he changed everything for me',1,'2026-09-25 20:55:52');
INSERT INTO "reviews" ("id","client_id","name","business","rating","review","approved","created_at") VALUES('59a91856-968a-44e3-9e58-293aa126553b',NULL,'James Carter','E-commerce Brand',4,'Good work overall. The changes made the site easier to understand, although we still had a few things to fix on our end.',1,'2026-09-25 20:58:36');
INSERT INTO "reviews" ("id","client_id","name","business","rating","review","approved","created_at") VALUES('c52c258e-58ee-4a75-b4cc-a548c862808e',NULL,'Marcus Rock','Gadget',4,'Our emails were getting opened but not doing much after that. but the new flow he built made a noticeable difference.',1,'2026-09-25 21:01:36');
INSERT INTO "reviews" ("id","client_id","name","business","rating","review","approved","created_at") VALUES('429f1e94-c95a-438e-9492-ba0b852bb5f0',NULL,'Marcus Reed','Northstar SaaS',5,'I knew something was wrong, but couldn’t see where. But he he showed us exactly where people were dropping off, then fixed it for us. Btw, Precious, I love the private portal experience tho🤝🏻👏🏻',1,'2026-09-28 23:03:14');
CREATE TABLE blog_comments (
    id TEXT PRIMARY KEY,
    article_slug TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    comment TEXT NOT NULL,
    approved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE CASCADE
);
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('2c1ab199-d1d6-4b42-9c05-a280a21ffa5b','c0fb68da-cf70-489b-a646-f46cd5b95c2c','new_client','New Leak Hunt Request','ELIJAH PRECIOUS OSAGIE submitted a new Leak Hunt request.',0,'2026-09-21 17:58:06');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('8a182ced-f912-49fe-a9bb-dd1c75de40a8','0239ec67-5741-4fd8-a9dd-cf80f3858b5f','new_client','New Leak Hunt Request','Precious Elijah submitted a new Leak Hunt request.',0,'2026-09-21 18:01:27');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('2b1544fd-dc87-4dcf-bd02-29d7f7d61c90','1fb0d873-d252-41f5-b176-380032af1e5c','new_client','New Leak Hunt Request','Precious Elijah submitted a new Leak Hunt request.',0,'2026-09-21 18:05:33');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('884697e0-ea0f-438e-adee-e4323e4e08ee','af09495c-f665-410b-9417-18bdf6a671c8','new_client','New Leak Hunt Request','ncnc submitted a new Leak Hunt request.',0,'2026-09-21 18:07:13');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('170555f3-0ebd-4dfe-980c-07e8d7946623','456b8411-0bfc-47d0-a807-66d5a717c53e','new_client','New Leak Hunt Request','Precious Elijah submitted a new Leak Hunt request.',0,'2026-09-21 18:14:45');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('b2a57086-6e91-4c77-933c-17dd0ed0b9c5','67ec3ecd-4763-49fb-b9c2-a283eb14b32d','new_client','New Leak Hunt Request','Precious Elijah submitted a new Leak Hunt request.',0,'2026-09-21 18:16:27');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('582d7959-6ff7-48cb-8d82-585583f85838','198e3d02-a366-4df5-8005-85ae9b6333c5','new_client','New Leak Hunt Request','Eejjsej submitted a new Leak Hunt request.',0,'2026-09-21 18:26:29');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('ca037bbc-deec-44ad-b2d3-940b748a6d66','ff27d8ba-a9e4-4a99-8d08-26d6ac62e3f4','new_client','New Leak Hunt Request','Precious Elijah submitted a new Leak Hunt request.',0,'2026-09-21 18:31:41');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('45b14b5e-e4fd-4e21-9805-d345bb989eb1','6697b9d5-f428-4f45-bae3-367ca26ee5cc','new_client','New Leak Hunt Request','nnc submitted a new Leak Hunt request.',0,'2026-09-21 19:00:59');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('d2106fcf-70c8-439b-a373-c6fee0cfacfe','cb6e5551-bdd9-425b-ad43-9256fd1f9e83','new_client','New Leak Hunt Request','Precious Elijah submitted a new Leak Hunt request.',0,'2026-09-21 19:04:16');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('41cebe7f-f4cd-42aa-8337-9e98343744de','37ad9172-2c53-48a0-a16b-24724a7dd2a7','new_client','New Leak Hunt Request','nnc submitted a new Leak Hunt request.',0,'2026-09-21 19:05:35');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('ed863ee8-c7c0-454e-b8d7-e11613ff1812','b7d08183-e626-4237-8d61-20b3f8ae04b1','new_client','New Leak Hunt Request','mm submitted a new Leak Hunt request.',0,'2026-09-21 19:08:09');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('9a46f4f0-0769-4d8b-a2bd-c614f87523bb','092ae385-7046-49d8-84de-3bbde7b25635','new_client','New Leak Hunt Request','mm submitted a new Leak Hunt request.',0,'2026-09-21 19:14:33');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('05b764e1-d55f-4896-8aa6-4dfdf06a40a8','f27f7b67-0831-42af-8f97-397c23345cef','new_client','New Leak Hunt Request','Backend Test submitted a new Leak Hunt request.',0,'2026-09-21 19:16:56');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('d3011e24-588f-4251-b411-35879dd5255c','85d4dccb-2c42-4681-857d-86713f3361d4','new_client','New Leak Hunt Request','Backend Test submitted a new Leak Hunt request.',0,'2026-09-21 19:18:30');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('ba524409-b061-4978-938e-d5f9c3a44f99','12a31110-a772-442f-8026-2b077c6f1f4a','new_client','New Leak Hunt Request','nc submitted a new Leak Hunt request.',0,'2026-09-21 19:23:38');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('3250b77f-7cf1-471a-985a-9f5330616700','556c9cab-d025-47af-a93d-fc3fbbc01117','new_client','New Leak Hunt Request','Backend Test submitted a new Leak Hunt request.',0,'2026-09-21 19:24:52');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('635ab3fd-1b83-47b0-ab12-bd2e3b93245f','d51072db-ec6b-4ee3-8980-144fd358db74','new_client','New Leak Hunt Request','Precious Osason submitted a new Leak Hunt request.',0,'2026-09-21 19:29:42');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('579463fc-1bd1-4370-9509-c632235e6e30','bc54c787-bb09-41cb-a76c-8db6c73b531e','new_client','New Leak Hunt Request','mm submitted a new Leak Hunt request.',0,'2026-09-21 19:39:42');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('6f0d8a58-8f6e-4f84-a68f-be23d82e91f5','bc54c787-bb09-41cb-a76c-8db6c73b531e','new_message','New Client Message','mm sent a new portal message.',0,'2026-09-21 20:01:37');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('8f933f87-9717-479b-a632-dc915470589d','bc54c787-bb09-41cb-a76c-8db6c73b531e','new_message','New Client Message','mm sent a new portal message.',0,'2026-09-21 20:01:47');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('c28af18a-f5c7-4425-8eac-08feaa16204a','bc54c787-bb09-41cb-a76c-8db6c73b531e','admin_message','New Message From Revenue Leak Hunter','You have received a new message regarding your Leak Hunt.',1,'2026-09-21 20:27:04');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('c314e3c4-f0d2-461d-a4c2-8a0a9f19ccde','cb618dca-33de-4540-9e38-02e4666430fa','new_client','New Leak Hunt Request','ELIJAH PRECIOUS OSAGIE submitted a new Leak Hunt request.',0,'2026-09-21 20:34:50');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('021f433b-d344-47a5-a2ff-b365791c26f1','cb618dca-33de-4540-9e38-02e4666430fa','new_message','New Client Message','ELIJAH PRECIOUS OSAGIE sent a new message.',0,'2026-09-21 20:36:30');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('26adfee9-16f1-4712-94aa-900d8b8367c4','cb618dca-33de-4540-9e38-02e4666430fa','admin_message','New Message From Revenue Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-21 20:36:58');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('7c09e07d-0760-4a17-8bc6-40684f81b1d6','222d5fa2-8efa-475f-aba6-18c3b466ab68','new_client','New Leak Hunt Request','Precious Elijah submitted a new Leak Hunt request.',0,'2026-09-22 07:23:22');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('c10ec004-7b18-41dd-9088-89b31c1b91eb','8eed239f-8957-4c1e-8bf4-b4294c2305ee','new_client','New Leak Hunt Request','Precious Osason submitted a new Leak Hunt request.',0,'2026-09-22 12:24:47');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('b4d632b0-bc0b-4c65-9410-c6b7097e8025','8eed239f-8957-4c1e-8bf4-b4294c2305ee','new_message','New Client Message','Precious Osason sent a new message.',0,'2026-09-22 12:25:04');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('6e47dba4-f77c-4a1e-acdf-79f0502eb10e','8eed239f-8957-4c1e-8bf4-b4294c2305ee','admin_message','New Message From Revenue Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-22 12:25:22');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('e321ce53-8948-4a67-ba6b-2930d605ea81','8eed239f-8957-4c1e-8bf4-b4294c2305ee','admin_message','New Message From Revenue Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-22 12:25:47');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('74b934c5-9385-4cf0-8849-429cf9ed8075','8eed239f-8957-4c1e-8bf4-b4294c2305ee','new_message','New Client Message','Precious Osason sent a new message.',0,'2026-09-22 12:26:10');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('57178266-0a16-41c0-ae0c-d23e572e84fc','8eed239f-8957-4c1e-8bf4-b4294c2305ee','admin_message','New Message From Revenue Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-22 12:26:49');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('0e49d693-a84a-4d47-bd56-9e9c67578374','8eed239f-8957-4c1e-8bf4-b4294c2305ee','new_message','New Client Message','Precious Osason sent a new message.',0,'2026-09-22 12:42:07');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('c3dbb6cf-9db2-4dad-84f6-36483886553b','8eed239f-8957-4c1e-8bf4-b4294c2305ee','new_message','New Client Message','Precious Osason sent a new message.',0,'2026-09-22 12:42:58');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('880311aa-b4b5-4c93-a9d3-a8cb7463c11e','8eed239f-8957-4c1e-8bf4-b4294c2305ee','new_message','New Client Message','Precious Osason sent a new message.',0,'2026-09-22 12:43:17');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('0bdee2c9-480f-4380-b5c4-b9b41f7255b6','8eed239f-8957-4c1e-8bf4-b4294c2305ee','new_message','New Client Message','Precious Osason sent a new message.',0,'2026-09-22 12:50:38');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('d022476c-9a6a-421a-9c39-0604583fe34e','8eed239f-8957-4c1e-8bf4-b4294c2305ee','new_message','New Client Message','Precious Osason sent a new message.',0,'2026-09-22 14:18:10');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('a099aa9b-7e6b-4408-bf56-8bc000eb2359','8eed239f-8957-4c1e-8bf4-b4294c2305ee','new_message','New Client Message','Precious Osason sent a new message.',0,'2026-09-22 14:18:12');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('2af756d4-6c5b-4b49-bce1-85219af26c3e','8eed239f-8957-4c1e-8bf4-b4294c2305ee','new_message','New Client Message','Precious Osason sent a new message.',0,'2026-09-22 14:23:36');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('453cf43d-52e4-42fb-aefd-9e0391de1214','74f4a4d5-e8df-49f8-81fd-87ebde5153e4','new_client','New Leak Hunt Request','f h submitted a new Leak Hunt request.',0,'2026-09-22 14:26:54');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('fbab36ff-b75e-467f-808c-7328c4c93257','74f4a4d5-e8df-49f8-81fd-87ebde5153e4','new_message','New Client Message','f h sent a new message.',0,'2026-09-22 14:27:18');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('5868aae4-042b-4e2f-a30a-d5a545c9ec28','74f4a4d5-e8df-49f8-81fd-87ebde5153e4','file_upload','New Client File','f h uploaded favicon.png.',0,'2026-09-22 14:27:19');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('085918d4-4270-423b-85c4-40ef05bba7ff','74f4a4d5-e8df-49f8-81fd-87ebde5153e4','admin_message','New Message From Revenue Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-22 14:36:18');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('19463a0a-525f-48ae-b8a0-a5fbce197902','74f4a4d5-e8df-49f8-81fd-87ebde5153e4','admin_file','New File From Revenue Leak Hunter','A file named 10. Final Review and Project Approval.pdf was added to your Leak Hunt conversation.',0,'2026-09-22 14:36:19');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('b6254279-9936-4c07-9bcc-a584beba2044','18e853af-d735-4c3e-a159-92c5754507c2','new_client','New Leak Hunt Request','Precious Elijah submitted a new Leak Hunt request.',0,'2026-09-22 14:52:40');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('4d7b50ce-8eaf-4509-ba51-7fecc68f451b','18e853af-d735-4c3e-a159-92c5754507c2','new_message','New Client Message','Precious Elijah sent a new message.',0,'2026-09-22 14:53:03');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('d0240982-89c7-431e-a34d-5c3b3f06ed78','18e853af-d735-4c3e-a159-92c5754507c2','admin_message','New Message From Revenue Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-22 14:54:02');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('c17146c4-1c5f-4d79-8b4d-e74fba0de6ec','18e853af-d735-4c3e-a159-92c5754507c2','new_message','New Client Message','Precious Elijah sent a new message.',0,'2026-09-22 14:54:18');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('568b1723-1cb4-462f-84e4-8a6c47bfd4b5','18e853af-d735-4c3e-a159-92c5754507c2','admin_message','New Message From Revenue Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-22 14:54:33');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('0067c904-e921-4e90-ac07-126c69acdd49','18e853af-d735-4c3e-a159-92c5754507c2','new_message','New Client Message','Precious Elijah sent a new message.',0,'2026-09-22 14:54:40');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('6ea3b63a-642f-4c16-9163-dcbb417f1277','18e853af-d735-4c3e-a159-92c5754507c2','new_message','New Client Message','Precious Elijah sent a new message.',0,'2026-09-22 14:55:13');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('9a9b94d7-76a9-46cb-bef0-e7ec8b4559c5','18e853af-d735-4c3e-a159-92c5754507c2','file_upload','New Client File','Precious Elijah uploaded IMG_20260920_161359_435.jpg.',0,'2026-09-22 14:55:24');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('d932f1ae-3ee4-4f4e-9e67-c91de6e347cc','18e853af-d735-4c3e-a159-92c5754507c2','admin_message','New Message From Revenue Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-22 14:55:51');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('a3184083-7c83-4374-8d58-69c8c0b0831d','18e853af-d735-4c3e-a159-92c5754507c2','admin_file','New File From Revenue Leak Hunter','A file named Precious Elijah Linkedin.png was added to your Leak Hunt conversation.',0,'2026-09-22 14:55:55');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('ff94025f-aaae-44d5-aa22-1d94695c51d6','e9c04555-4d35-4a4a-a550-c11fc9a7364d','new_client','New Leak Hunt Request','Michael Adamson submitted a new Leak Hunt request.',0,'2026-09-22 15:30:04');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('9b459c9c-817e-4853-887b-6cda601f5b8f','e9c04555-4d35-4a4a-a550-c11fc9a7364d','new_message','New Client Message','Michael Adamson sent a new message.',0,'2026-09-22 15:32:52');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('dc534cb6-f521-4879-8bd8-0ee81a7184e4','e9c04555-4d35-4a4a-a550-c11fc9a7364d','file_upload','New Client File','Michael Adamson uploaded Screenshot_20260922-163014.png.',0,'2026-09-22 15:32:55');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('77576c38-f130-483b-94a2-caa4c4c477de','e9c04555-4d35-4a4a-a550-c11fc9a7364d','admin_message','New Message From Revenue Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-22 15:35:06');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('2555326e-2c25-4217-a460-e73dab0092a2','e9c04555-4d35-4a4a-a550-c11fc9a7364d','admin_file','New File From Revenue Leak Hunter','A file named ChatGPT Image Jan 10_ 2026_ 09_45_25 AM.png was added to your Leak Hunt conversation.',0,'2026-09-22 15:35:09');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('fe595ccc-53d5-4b96-94da-bea2a6f5c39f','e9c04555-4d35-4a4a-a550-c11fc9a7364d','admin_message','New Message From Revenue Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-22 15:39:40');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('e5767641-1f0d-4f9f-8763-9719c58d0868','e9c04555-4d35-4a4a-a550-c11fc9a7364d','admin_file','New File From Revenue Leak Hunter','A file named MY_NEW_PERSONAL_OPTIMIZED_SCOUTING_CONTENTS.pdf was added to your Leak Hunt conversation.',0,'2026-09-22 15:39:41');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('213419cf-fb15-4fe1-851e-9fb77070ee12','e9c04555-4d35-4a4a-a550-c11fc9a7364d','admin_message','New Message From Revenue Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-22 15:40:17');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('cc5eb19f-24c4-4fb7-8299-60e6f0d3be9b','e9c04555-4d35-4a4a-a550-c11fc9a7364d','new_message','New Client Message','Michael Adamson sent a new message.',0,'2026-09-22 16:44:45');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('c36466ae-2b63-4d03-bece-b1f736189b3b','7f1b5a84-52b3-4932-946f-3b4df33100b1','new_client','New Leak Hunt Request','Precious Elijah submitted a new Leak Hunt request.',0,'2026-09-23 20:29:28');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('fc521877-b146-4146-b54a-b38dd5c2b931','7f1b5a84-52b3-4932-946f-3b4df33100b1','new_message','New Client Message','Precious Elijah sent a new message.',0,'2026-09-23 20:29:47');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('3e81e126-81f2-4e44-a5b2-690e1664fdbc','7f1b5a84-52b3-4932-946f-3b4df33100b1','admin_message','New Message From Revenue Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-23 20:31:00');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('a1b1f5e8-989d-4ada-9ef6-1bdecd1a32c0','7f1b5a84-52b3-4932-946f-3b4df33100b1','admin_message','New Message From Revenue Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-23 20:31:13');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('b424507b-4cd6-4a09-98a4-e33c9b8e91ab','7f1b5a84-52b3-4932-946f-3b4df33100b1','new_message','New Client Message','Precious Elijah sent a new message.',0,'2026-09-23 20:31:24');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('bb8352cf-241c-4853-8b54-0bd4f14dc45a','7f1b5a84-52b3-4932-946f-3b4df33100b1','new_message','New Client Message','Precious Elijah sent a new message.',0,'2026-09-24 07:37:13');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('6972f634-78f1-4f68-9a04-2ca2578039b1','7f1b5a84-52b3-4932-946f-3b4df33100b1','new_message','New Client Message','Precious Elijah sent a new message.',1,'2026-09-24 07:37:32');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('11f21aa7-8a3d-4ab7-b8e9-60af8b5c812a','7f1b5a84-52b3-4932-946f-3b4df33100b1','new_message','New Client Message','Precious Elijah sent a new message.',1,'2026-09-24 07:37:47');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('6ce6cb68-8b61-4255-bb9a-a9bc78a85515','e9c04555-4d35-4a4a-a550-c11fc9a7364d','admin_message','New Message From Revenue Leak Hunter','You have received a new message regarding your Leak Hunt.',1,'2026-09-24 07:40:16');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('d7395325-9403-4023-bfaa-0eb50de8a770','e9c04555-4d35-4a4a-a550-c11fc9a7364d','admin_message','New Message From Revenue Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-24 07:43:34');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('6c2f482f-d14f-4afc-a528-0a941612b8d3','7f1b5a84-52b3-4932-946f-3b4df33100b1','admin_message','New Message From Revenue Leak Hunter','You have received a new message regarding your Leak Hunt.',1,'2026-09-24 07:45:47');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('0dd08f0e-df2b-45bc-8694-51c064eb525b','d51072db-ec6b-4ee3-8980-144fd358db74','new_message','New Client Message','Precious Osason sent a new message.',0,'2026-09-25 12:56:47');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('25f41d3e-a8d8-4f25-9625-6000d6f455bf','d51072db-ec6b-4ee3-8980-144fd358db74','admin_message','New Message From Conversion Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-25 12:57:13');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('ea4e9327-523d-486a-89b7-a5bd3e69d3e2','6c4a0167-ef5d-4848-bbed-3e44de767f97','new_client','New Leak Hunt Request','Soyemi Oluwatofarati joel Soyemi submitted a new Leak Hunt request.',0,'2026-09-27 08:05:12');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('1be73e9c-4d90-422f-9e8c-1143d791b671','6c4a0167-ef5d-4848-bbed-3e44de767f97','new_message','New Client Message','Soyemi Oluwatofarati joel Soyemi sent a new message.',0,'2026-09-27 08:06:38');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('ffccc176-b6a4-410a-a55e-ac8efa08a373','6c4a0167-ef5d-4848-bbed-3e44de767f97','admin_message','New Message From Conversion Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-27 08:11:01');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('135f9116-d268-4675-975b-1a18308acc4e','7f1b5a84-52b3-4932-946f-3b4df33100b1','new_message','New Client Message','Precious Elijah sent a new message.',0,'2026-09-29 10:41:07');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('7e4419fa-01b5-4a54-ac04-0aac99b1dda7','7f1b5a84-52b3-4932-946f-3b4df33100b1','admin_message','New Message From Conversion Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-29 10:41:23');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('4ee9da6d-3ac8-4e9d-ba53-6aa4c81887af','7f1b5a84-52b3-4932-946f-3b4df33100b1','new_message','New Client Message','Precious Elijah sent a new message.',0,'2026-09-29 10:41:53');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('62e39403-bb17-48cc-8f9f-11c5f0bd06b0','7f1b5a84-52b3-4932-946f-3b4df33100b1','new_message','New Client Message','Precious Elijah sent a new message.',0,'2026-09-29 10:42:24');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('b7181e7a-55c6-48bf-bb72-786e94ff21a1','7f1b5a84-52b3-4932-946f-3b4df33100b1','new_message','New Client Message','Precious Elijah sent a new message.',0,'2026-09-29 10:42:51');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('5783560f-8038-4785-a544-6c90e75c15a1','7f1b5a84-52b3-4932-946f-3b4df33100b1','admin_message','New Message From Conversion Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-29 10:43:31');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('154a919a-6bbd-48e6-9009-15612a191a28','7f1b5a84-52b3-4932-946f-3b4df33100b1','new_message','New Client Message','Precious Elijah sent a new message.',0,'2026-09-29 10:50:09');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('25123f21-9397-4a72-9dea-9cb43a7ae060','7f1b5a84-52b3-4932-946f-3b4df33100b1','admin_message','New Message From Conversion Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-29 11:09:03');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('19a69ced-6d0e-4af8-8e29-aa788d6e796c','7f1b5a84-52b3-4932-946f-3b4df33100b1','admin_message','New Message From Conversion Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-29 11:13:03');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('2d6c7337-79fb-4893-aa36-2b554cb24473','7f1b5a84-52b3-4932-946f-3b4df33100b1','admin_message','New Message From Conversion Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-29 11:17:52');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('7d17d6b4-9f94-4dcd-a759-6101e91f92ab','7f1b5a84-52b3-4932-946f-3b4df33100b1','admin_message','New Message From Conversion Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-29 11:18:36');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('1eabb193-dd04-4cd8-8fc2-526aee4f4514','7f1b5a84-52b3-4932-946f-3b4df33100b1','admin_message','New Message From Conversion Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-29 11:19:41');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('469b82c2-95c5-45ab-81e9-35e7d54af8e9','7f1b5a84-52b3-4932-946f-3b4df33100b1','admin_message','New Message From Conversion Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-29 11:25:29');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('14ec766c-99f2-4986-bbc8-79532198b8d9','7f1b5a84-52b3-4932-946f-3b4df33100b1','admin_message','New Message From Conversion Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-29 11:26:55');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('86693bf8-3b84-4963-a7bf-040adc8a9786','7f1b5a84-52b3-4932-946f-3b4df33100b1','admin_message','New Message From Conversion Leak Hunter','You have received a new message regarding your Leak Hunt.',0,'2026-09-29 11:28:25');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('ffd6d791-d19e-467f-b0fd-f6caf0e2c94a','7f1b5a84-52b3-4932-946f-3b4df33100b1','admin_file','New File From Conversion Leak Hunter','A file named favicon (1).png was added to your Leak Hunt conversation.',0,'2026-09-29 11:28:27');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('2ed1dbce-fa03-4ed7-83b1-55723571161e','7f1b5a84-52b3-4932-946f-3b4df33100b1','new_message','New Client Message','Precious Elijah sent a new message.',0,'2026-09-29 11:28:56');
INSERT INTO "notifications" ("id","client_id","type","title","message","read","created_at") VALUES('76e13280-e70f-40ae-bcdd-8c23e5bf221a','7f1b5a84-52b3-4932-946f-3b4df33100b1','file_upload','New Client File','Precious Elijah uploaded Screenshot_20260929-091812.png.',0,'2026-09-29 11:28:57');
CREATE TABLE admin_sessions (
    id TEXT PRIMARY KEY,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('6de3cd82-a9e0-41cd-b33b-06a9e50708ca','2026-09-22T20:20:25.734Z','2026-09-21 20:20:25');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('6685497f-98be-436b-95c7-b83d3ce4c76c','2026-09-22T20:33:05.951Z','2026-09-21 20:33:06');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('f019d564-7e60-4da4-8683-4554b5e9147e','2026-09-23T14:52:03.901Z','2026-09-22 14:52:03');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('0f9b3c39-6699-4407-bf35-39ea241f9b14','2026-09-23T16:56:39.191Z','2026-09-22 16:56:39');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('6ac98d47-a92a-4c9b-bde6-12df5982e67a','2026-09-24T12:31:39.366Z','2026-09-23 12:31:39');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('00a20384-28bc-4965-bad3-854c14366efa','2026-09-24T13:01:21.275Z','2026-09-23 13:01:21');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('b714a313-ba53-43ce-96ee-ec4d807d8063','2026-09-24T13:10:53.585Z','2026-09-23 13:10:53');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('eaf37493-f351-4658-90e6-ab8bc9e90c66','2026-09-24T13:44:14.150Z','2026-09-23 13:44:14');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('aefb7c5a-3915-404d-b06b-9046018bee26','2026-09-24T13:54:00.954Z','2026-09-23 13:54:01');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('5fee966e-9f37-4c0f-930c-84411b6e33cb','2026-09-24T14:00:23.201Z','2026-09-23 14:00:23');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('b8930f29-3d46-41de-abd6-b9886c13e0da','2026-09-24T14:20:48.183Z','2026-09-23 14:20:48');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('16a87815-1635-4d5f-91a9-6e33a8e52972','2026-09-24T15:07:27.790Z','2026-09-23 15:07:27');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('bf8c56d5-a39b-4d2f-bda2-cc903431262f','2026-09-24T15:22:22.752Z','2026-09-23 15:22:22');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('f87527aa-bd9f-4f1a-b7f3-1a0608f02f05','2026-09-24T16:14:11.748Z','2026-09-23 16:14:11');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('558b57b7-811b-4b67-aa7a-ce99a745dc2f','2026-09-24T16:23:14.293Z','2026-09-23 16:23:14');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('81eb461d-aede-4016-a9ce-a1ce9632e6dd','2026-09-24T20:18:02.197Z','2026-09-23 20:18:02');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('2bb6477c-ac47-4d88-98ba-d03c1fba6624','2026-09-24T20:30:27.292Z','2026-09-23 20:30:27');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('72269a7e-2b09-41b4-bf5f-bc01c4eb701b','2026-09-24T20:42:41.943Z','2026-09-23 20:42:41');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('37a21608-6818-47f0-bcf6-936b2acc9e54','2026-09-24T21:00:00.721Z','2026-09-23 21:00:00');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('77756516-97a0-498a-a57d-2dbb7338982c','2026-09-24T21:16:21.327Z','2026-09-23 21:16:21');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('f69070c3-ace5-4a9b-8064-0869c4386249','2026-09-24T21:45:08.482Z','2026-09-23 21:45:08');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('59ed2693-2a7d-4c0e-988d-8b3c9abda214','2026-09-24T22:34:48.761Z','2026-09-23 22:34:48');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('db2b5ff8-3bc4-4a29-becd-cc4067b89ec5','2026-09-25T07:39:11.958Z','2026-09-24 07:39:12');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('3bd02e52-f868-49fb-a961-40d84be421e9','2026-09-27T12:30:34.704Z','2026-09-26 12:30:34');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('2509cab4-ea6b-4c21-822e-c97d68f49027','2026-09-27T18:16:04.239Z','2026-09-26 18:16:04');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('a92d87b2-f8c8-4e27-b5ee-e71fe3732905','2026-09-27T18:20:17.028Z','2026-09-26 18:20:17');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('cc76a7ed-8259-45dc-8c33-ae539908f6d2','2026-09-28T07:36:53.521Z','2026-09-27 07:36:53');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('3f5dede6-ba22-4fff-923b-a595b2b0e2e3','2026-09-29T20:30:14.832Z','2026-09-28 20:30:14');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('2c748dff-3c01-422b-9789-54a3a92d4656','2026-09-30T09:27:19.862Z','2026-09-29 09:27:19');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('0fea5ec2-4073-4ff9-89ca-fa607119fa53','2026-09-30T09:35:43.375Z','2026-09-29 09:35:43');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('19147169-e3ca-4495-b46d-c97f737186bb','2026-09-30T10:40:04.515Z','2026-09-29 10:40:04');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('5e3eaafb-4e9e-4528-9490-c61f5f369482','2026-09-30T11:08:40.341Z','2026-09-29 11:08:40');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('c75100fc-de86-4488-9a7c-2966ff811548','2026-09-30T11:48:49.516Z','2026-09-29 11:48:49');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('c36ba3dd-4216-4bd0-a7b2-0ba13b8f534c','2026-09-30T13:58:18.650Z','2026-09-29 13:58:18');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('2906dd36-1705-4cc7-9552-d5016f4d49f1','2026-09-30T14:00:33.452Z','2026-09-29 14:00:33');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('aa0200a0-8333-4a09-94ba-8fa95712ee68','2026-09-30T14:03:17.623Z','2026-09-29 14:03:17');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('dd089474-27ec-421d-834b-a6b4bd550b1d','2026-10-01T14:09:26.909Z','2026-09-30 14:09:26');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('9c9aee5e-d374-4c7e-969e-6b4af0e8ef16','2026-10-01T14:13:09.169Z','2026-09-30 14:13:09');
INSERT INTO "admin_sessions" ("id","expires_at","created_at") VALUES('6c5eec92-937c-40a6-97e7-80c58fb2267a','2026-10-01T14:53:34.416Z','2026-09-30 14:53:34');
CREATE TABLE files (
    id TEXT PRIMARY KEY,

    client_id TEXT NOT NULL,

    conversation_id TEXT NOT NULL,

    message_id TEXT,

    original_name TEXT NOT NULL,

    storage_key TEXT NOT NULL UNIQUE,

    content_type TEXT NOT NULL,

    file_size INTEGER NOT NULL,

    uploaded_by TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE CASCADE,

    FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE,

    FOREIGN KEY (message_id)
        REFERENCES messages(id)
        ON DELETE SET NULL
);
INSERT INTO "files" ("id","client_id","conversation_id","message_id","original_name","storage_key","content_type","file_size","uploaded_by","created_at") VALUES('96ec9288-a37a-46cb-8f35-201e294020bf','74f4a4d5-e8df-49f8-81fd-87ebde5153e4','02bcd736-2d3b-4b84-95a6-89d52ac8d7b9','59140aab-847d-49df-88c0-d1ad1ce42feb','favicon.png','clients/74f4a4d5-e8df-49f8-81fd-87ebde5153e4/conversations/02bcd736-2d3b-4b84-95a6-89d52ac8d7b9/96ec9288-a37a-46cb-8f35-201e294020bf.png','image/png',104157,'client','2026-09-22 14:27:19');
INSERT INTO "files" ("id","client_id","conversation_id","message_id","original_name","storage_key","content_type","file_size","uploaded_by","created_at") VALUES('3e3e9572-462f-43d3-8044-efb104eca37f','74f4a4d5-e8df-49f8-81fd-87ebde5153e4','02bcd736-2d3b-4b84-95a6-89d52ac8d7b9','f150e49c-fefe-4bf4-b627-debd002c51f0','10. Final Review and Project Approval.pdf','clients/74f4a4d5-e8df-49f8-81fd-87ebde5153e4/conversations/02bcd736-2d3b-4b84-95a6-89d52ac8d7b9/3e3e9572-462f-43d3-8044-efb104eca37f.pdf','application/pdf',48395,'admin','2026-09-22 14:36:19');
INSERT INTO "files" ("id","client_id","conversation_id","message_id","original_name","storage_key","content_type","file_size","uploaded_by","created_at") VALUES('fe1fa861-f1e9-4766-9d40-abee5ca0987c','18e853af-d735-4c3e-a159-92c5754507c2','e8e5e68d-7b6a-422b-907d-d373422d683e','6b607f74-0b9f-4842-9dc7-623e364043ce','IMG_20260920_161359_435.jpg','clients/18e853af-d735-4c3e-a159-92c5754507c2/conversations/e8e5e68d-7b6a-422b-907d-d373422d683e/fe1fa861-f1e9-4766-9d40-abee5ca0987c.jpg','image/jpeg',1802848,'client','2026-09-22 14:55:24');
INSERT INTO "files" ("id","client_id","conversation_id","message_id","original_name","storage_key","content_type","file_size","uploaded_by","created_at") VALUES('3daa0c26-751a-40e5-a246-d03f95ce2001','18e853af-d735-4c3e-a159-92c5754507c2','e8e5e68d-7b6a-422b-907d-d373422d683e','0371295e-babc-41da-8e93-b523cee9db7f','Precious Elijah Linkedin.png','clients/18e853af-d735-4c3e-a159-92c5754507c2/conversations/e8e5e68d-7b6a-422b-907d-d373422d683e/3daa0c26-751a-40e5-a246-d03f95ce2001.png','image/png',1794103,'admin','2026-09-22 14:55:55');
INSERT INTO "files" ("id","client_id","conversation_id","message_id","original_name","storage_key","content_type","file_size","uploaded_by","created_at") VALUES('b1f3f58c-84fb-4082-a580-3cebd8dabd42','e9c04555-4d35-4a4a-a550-c11fc9a7364d','1999fab9-0f2e-4e7d-913d-f23fc48c5a2b','b35acd33-caf0-436b-9173-8c894ed062ff','Screenshot_20260922-163014.png','clients/e9c04555-4d35-4a4a-a550-c11fc9a7364d/conversations/1999fab9-0f2e-4e7d-913d-f23fc48c5a2b/b1f3f58c-84fb-4082-a580-3cebd8dabd42.png','image/png',125404,'client','2026-09-22 15:32:55');
INSERT INTO "files" ("id","client_id","conversation_id","message_id","original_name","storage_key","content_type","file_size","uploaded_by","created_at") VALUES('8204417e-eac0-400c-b585-48b6e648be33','e9c04555-4d35-4a4a-a550-c11fc9a7364d','1999fab9-0f2e-4e7d-913d-f23fc48c5a2b','63f53400-04a2-4997-9ccc-59549ef3cea3','ChatGPT Image Jan 10_ 2026_ 09_45_25 AM.png','clients/e9c04555-4d35-4a4a-a550-c11fc9a7364d/conversations/1999fab9-0f2e-4e7d-913d-f23fc48c5a2b/8204417e-eac0-400c-b585-48b6e648be33.png','image/png',1884440,'admin','2026-09-22 15:35:09');
INSERT INTO "files" ("id","client_id","conversation_id","message_id","original_name","storage_key","content_type","file_size","uploaded_by","created_at") VALUES('637f577f-d7ae-48ce-b267-f1c2cbc83161','e9c04555-4d35-4a4a-a550-c11fc9a7364d','1999fab9-0f2e-4e7d-913d-f23fc48c5a2b','35337802-07ab-4755-9057-89968f92b34b','MY_NEW_PERSONAL_OPTIMIZED_SCOUTING_CONTENTS.pdf','clients/e9c04555-4d35-4a4a-a550-c11fc9a7364d/conversations/1999fab9-0f2e-4e7d-913d-f23fc48c5a2b/637f577f-d7ae-48ce-b267-f1c2cbc83161.pdf','application/pdf',40177,'admin','2026-09-22 15:39:41');
INSERT INTO "files" ("id","client_id","conversation_id","message_id","original_name","storage_key","content_type","file_size","uploaded_by","created_at") VALUES('d221b327-ad2e-4dea-b9e5-82bd5c8a342b','7f1b5a84-52b3-4932-946f-3b4df33100b1','d61db155-822b-4faf-b39c-4ec126e6fd25','22a3d17d-7a41-44a2-ba81-e6a3c568c83c','favicon (1).png','clients/7f1b5a84-52b3-4932-946f-3b4df33100b1/conversations/d61db155-822b-4faf-b39c-4ec126e6fd25/d221b327-ad2e-4dea-b9e5-82bd5c8a342b.png','image/png',104157,'admin','2026-09-29 11:28:27');
INSERT INTO "files" ("id","client_id","conversation_id","message_id","original_name","storage_key","content_type","file_size","uploaded_by","created_at") VALUES('8cdef7ac-6126-4863-9784-db174e4ac3dd','7f1b5a84-52b3-4932-946f-3b4df33100b1','d61db155-822b-4faf-b39c-4ec126e6fd25','8d381be4-7828-4e0f-8ca9-158acff6a1c2','Screenshot_20260929-091812.png','clients/7f1b5a84-52b3-4932-946f-3b4df33100b1/conversations/d61db155-822b-4faf-b39c-4ec126e6fd25/8cdef7ac-6126-4863-9784-db174e4ac3dd.png','image/png',71799,'client','2026-09-29 11:28:57');
CREATE TABLE attachments (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL,
    conversation_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    r2_key TEXT NOT NULL UNIQUE,
    uploaded_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (message_id)
        REFERENCES messages(id)
        ON DELETE CASCADE,

    FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE,

    FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE CASCADE
);
CREATE TABLE analytics_visitors (
    visitor_id TEXT PRIMARY KEY,
    first_seen_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    first_referrer TEXT,
    first_landing_page TEXT,
    last_page TEXT,
    session_count INTEGER NOT NULL DEFAULT 0,
    event_count INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "analytics_visitors" ("visitor_id","first_seen_at","last_seen_at","first_referrer","first_landing_page","last_page","session_count","event_count") VALUES('v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','2026-09-29T13:48:14.516Z','2026-09-30T11:13:39.133Z','https://revenue-leak-hunter.pages.dev/pages/services/services','/','/',7,20);
INSERT INTO "analytics_visitors" ("visitor_id","first_seen_at","last_seen_at","first_referrer","first_landing_page","last_page","session_count","event_count") VALUES('v_7d38f195-120f-4a8f-9dc1-9c79d097ce17','2026-09-30T10:48:30.543Z','2026-09-30T10:48:30.543Z',NULL,'/','/',1,1);
INSERT INTO "analytics_visitors" ("visitor_id","first_seen_at","last_seen_at","first_referrer","first_landing_page","last_page","session_count","event_count") VALUES('v_c3f7c3e2-67c3-4c58-9bc4-cff9e084a2bb','2026-09-30T10:56:51.988Z','2026-09-30T10:56:51.988Z',NULL,'/','/',1,1);
INSERT INTO "analytics_visitors" ("visitor_id","first_seen_at","last_seen_at","first_referrer","first_landing_page","last_page","session_count","event_count") VALUES('v_e9d71273-3f48-41d0-aa6c-ad9811c93cbb','2026-09-30T10:56:59.523Z','2026-09-30T10:56:59.523Z',NULL,'/','/',1,1);
INSERT INTO "analytics_visitors" ("visitor_id","first_seen_at","last_seen_at","first_referrer","first_landing_page","last_page","session_count","event_count") VALUES('v_f09e8d22-2b9d-4ae4-8d8b-cace4d426cb3','2026-09-30T11:38:21.038Z','2026-09-30T12:03:11.437Z',NULL,'/','/',2,8);
INSERT INTO "analytics_visitors" ("visitor_id","first_seen_at","last_seen_at","first_referrer","first_landing_page","last_page","session_count","event_count") VALUES('v_3b567efb-181b-4310-8a93-9a92d0261dda','2026-09-30T11:45:55.141Z','2026-09-30T11:45:55.141Z',NULL,'/','/',1,1);
INSERT INTO "analytics_visitors" ("visitor_id","first_seen_at","last_seen_at","first_referrer","first_landing_page","last_page","session_count","event_count") VALUES('v_bc3e7104-a990-4f2f-a378-eb04d6872078','2026-09-30T12:00:04.656Z','2026-09-30T12:01:20.912Z',NULL,'/','/pages/services/services',2,4);
INSERT INTO "analytics_visitors" ("visitor_id","first_seen_at","last_seen_at","first_referrer","first_landing_page","last_page","session_count","event_count") VALUES('v_dba8b04f-997e-4f44-b08a-65ec6c1cdb99','2026-09-30T12:00:29.815Z','2026-09-30T12:00:29.815Z',NULL,'/','/',1,1);
INSERT INTO "analytics_visitors" ("visitor_id","first_seen_at","last_seen_at","first_referrer","first_landing_page","last_page","session_count","event_count") VALUES('v_e24c7745-453b-487a-8534-c5dd8026dacc','2026-09-30T12:01:39.247Z','2026-09-30T12:01:39.247Z',NULL,'/','/',1,1);
INSERT INTO "analytics_visitors" ("visitor_id","first_seen_at","last_seen_at","first_referrer","first_landing_page","last_page","session_count","event_count") VALUES('v_705e00ee-5654-46dc-93e6-b15cc39ef780','2026-09-30T12:03:25.096Z','2026-09-30T12:03:25.096Z',NULL,'/','/',1,1);
INSERT INTO "analytics_visitors" ("visitor_id","first_seen_at","last_seen_at","first_referrer","first_landing_page","last_page","session_count","event_count") VALUES('v_aa626074-5e57-4403-a1f8-a6f4d7916a0e','2026-09-30T12:07:54.064Z','2026-09-30T12:08:58.871Z',NULL,'/','/pages/terms/terms',1,8);
INSERT INTO "analytics_visitors" ("visitor_id","first_seen_at","last_seen_at","first_referrer","first_landing_page","last_page","session_count","event_count") VALUES('v_66157f4f-3056-4f9b-bd5e-8bfeeb081e56','2026-09-30T12:08:36.582Z','2026-09-30T12:08:36.582Z',NULL,'/','/',1,1);
INSERT INTO "analytics_visitors" ("visitor_id","first_seen_at","last_seen_at","first_referrer","first_landing_page","last_page","session_count","event_count") VALUES('v_337cfd6d-2f18-4b05-a6e3-162dd0673aa3','2026-09-30T12:30:34.820Z','2026-09-30T12:30:34.820Z',NULL,'/','/',1,1);
INSERT INTO "analytics_visitors" ("visitor_id","first_seen_at","last_seen_at","first_referrer","first_landing_page","last_page","session_count","event_count") VALUES('v_a43cbe5c-e26c-4993-8a42-eb72a40d87a2','2026-09-30T12:42:21.156Z','2026-09-30T12:42:21.156Z','https://www.google.com/','/','/',1,1);
INSERT INTO "analytics_visitors" ("visitor_id","first_seen_at","last_seen_at","first_referrer","first_landing_page","last_page","session_count","event_count") VALUES('v_168ad72a-cc21-4c47-9013-6b029c28e3a5','2026-09-30T13:55:17.274Z','2026-09-30T13:55:17.274Z',NULL,'/','/',1,1);
CREATE TABLE analytics_sessions (
    session_id TEXT PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    started_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    landing_page TEXT,
    referrer TEXT,
    last_page TEXT,
    event_count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (visitor_id) REFERENCES analytics_visitors(visitor_id) ON DELETE CASCADE
);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_410cdeae-472a-4fb0-bfe4-beec328aef39','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','2026-09-29T13:48:14.516Z','2026-09-29T13:49:14.754Z','/','https://revenue-leak-hunter.pages.dev/pages/services/services','/pages/reviews/reviews',6);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_1f71bed4-9ca4-420d-8627-e296709e4c6b','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','2026-09-29T16:03:47.453Z','2026-09-29T16:03:47.453Z','/',NULL,'/',1);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_6ab8d49f-1bd7-466b-b735-061099d68e2d','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','2026-09-30T08:21:33.314Z','2026-09-30T08:31:15.045Z','/',NULL,'/pages/portfolio/portfolio',5);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_b82be96f-f284-4420-9e11-ec550e89edac','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','2026-09-30T09:18:11.790Z','2026-09-30T09:44:28.840Z','/pages/portfolio/portfolio','https://revenue-leak-hunter.pages.dev/','/pages/portfolio/portfolio',4);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_447e110a-70f4-4f3e-be73-a45c79c9aa3f','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','2026-09-30T10:31:34.903Z','2026-09-30T10:31:34.908Z','/pages/portfolio/portfolio','https://revenue-leak-hunter.pages.dev/','/pages/portfolio/portfolio',2);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_84066aad-40d9-4559-9400-38d1b24c53bb','v_7d38f195-120f-4a8f-9dc1-9c79d097ce17','2026-09-30T10:48:30.543Z','2026-09-30T10:48:30.543Z','/',NULL,'/',1);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_f914d113-ff47-47ac-bb6d-05b166d29c7a','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','2026-09-30T10:49:25.212Z','2026-09-30T10:49:25.212Z','/',NULL,'/',1);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_12e64392-5031-4382-b627-3576d03fea67','v_c3f7c3e2-67c3-4c58-9bc4-cff9e084a2bb','2026-09-30T10:56:51.988Z','2026-09-30T10:56:51.988Z','/',NULL,'/',1);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_2384b700-6079-4066-bfe5-755105525f0a','v_e9d71273-3f48-41d0-aa6c-ad9811c93cbb','2026-09-30T10:56:59.523Z','2026-09-30T10:56:59.523Z','/',NULL,'/',1);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_6149e5fd-dbdb-48c6-a9e5-722348760aed','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','2026-09-30T11:13:39.133Z','2026-09-30T11:13:39.133Z','/',NULL,'/',1);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_fa537cb1-e2cb-4eb6-bfa9-11868e58d7e7','v_f09e8d22-2b9d-4ae4-8d8b-cace4d426cb3','2026-09-30T11:38:21.038Z','2026-09-30T11:39:45.356Z','/',NULL,'/pages/blog/blog',7);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_a9432d33-3459-4676-929f-d073c176b0ed','v_3b567efb-181b-4310-8a93-9a92d0261dda','2026-09-30T11:45:55.141Z','2026-09-30T11:45:55.141Z','/',NULL,'/',1);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_c5b82dc1-f122-4c51-814e-883f859fa850','v_bc3e7104-a990-4f2f-a378-eb04d6872078','2026-09-30T12:00:04.656Z','2026-09-30T12:00:18.399Z','/',NULL,'/',2);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_7091a294-be03-49bb-bcc3-0640d6e49c98','v_dba8b04f-997e-4f44-b08a-65ec6c1cdb99','2026-09-30T12:00:29.815Z','2026-09-30T12:00:29.815Z','/',NULL,'/',1);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_aca6fa28-c36f-4d48-b1f4-ce0c87f9cfbc','v_bc3e7104-a990-4f2f-a378-eb04d6872078','2026-09-30T12:01:05.869Z','2026-09-30T12:01:20.912Z','/','https://www.google.com/','/pages/services/services',2);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_d4f23014-b049-4457-9b51-982a345645d7','v_e24c7745-453b-487a-8534-c5dd8026dacc','2026-09-30T12:01:39.247Z','2026-09-30T12:01:39.247Z','/',NULL,'/',1);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_7a3ce8e5-2808-4380-ac69-1b1e97929422','v_f09e8d22-2b9d-4ae4-8d8b-cace4d426cb3','2026-09-30T12:03:11.437Z','2026-09-30T12:03:11.437Z','/',NULL,'/',1);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_29ce51e6-de53-4e90-b8e8-f01deeeb8175','v_705e00ee-5654-46dc-93e6-b15cc39ef780','2026-09-30T12:03:25.096Z','2026-09-30T12:03:25.096Z','/',NULL,'/',1);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_9ddf6114-135d-45d6-b2b3-22a811f0672b','v_aa626074-5e57-4403-a1f8-a6f4d7916a0e','2026-09-30T12:07:54.064Z','2026-09-30T12:08:58.871Z','/',NULL,'/pages/terms/terms',8);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_e4eb177c-2f1c-413e-bb70-5b1cdb5750a3','v_66157f4f-3056-4f9b-bd5e-8bfeeb081e56','2026-09-30T12:08:36.582Z','2026-09-30T12:08:36.582Z','/',NULL,'/',1);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_7842e842-47db-46e0-a2a5-a0b6fbe925c0','v_337cfd6d-2f18-4b05-a6e3-162dd0673aa3','2026-09-30T12:30:34.820Z','2026-09-30T12:30:34.820Z','/',NULL,'/',1);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_d83340e2-3490-45cb-ac69-cf8afccdc495','v_a43cbe5c-e26c-4993-8a42-eb72a40d87a2','2026-09-30T12:42:21.156Z','2026-09-30T12:42:21.156Z','/','https://www.google.com/','/',1);
INSERT INTO "analytics_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","referrer","last_page","event_count") VALUES('s_9a56ca04-a49a-4c9c-80e6-f1e9fb798890','v_168ad72a-cc21-4c47-9013-6b029c28e3a5','2026-09-30T13:55:17.274Z','2026-09-30T13:55:17.274Z','/',NULL,'/',1);
CREATE TABLE analytics_events (
    event_id TEXT PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    page TEXT,
    referrer TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (visitor_id) REFERENCES analytics_visitors(visitor_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE
);
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_fa5ef6eb-1f63-4954-84b9-3ca2cd843ca7','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_410cdeae-472a-4fb0-bfe4-beec328aef39','page_view','/','https://revenue-leak-hunter.pages.dev/pages/services/services','{"title":"Precious | Conversion Leak Hunter"}','2026-09-29T13:48:14.516Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_d577d917-6af1-4e92-be36-13d2fe54278d','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_410cdeae-472a-4fb0-bfe4-beec328aef39','cta_click','/','https://revenue-leak-hunter.pages.dev/pages/services/services','{"label":"Begin Investigation\n                        →"}','2026-09-29T13:48:27.664Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_f8930402-3a9e-4089-9715-2f85052869e2','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_410cdeae-472a-4fb0-bfe4-beec328aef39','page_view','/','https://revenue-leak-hunter.pages.dev/pages/contact/contact','{"title":"Precious | Conversion Leak Hunter"}','2026-09-29T13:48:39.496Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_17342aee-daa9-48db-9288-4d219857aa33','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_410cdeae-472a-4fb0-bfe4-beec328aef39','page_view','/pages/services/services','https://revenue-leak-hunter.pages.dev/','{"title":"Services | Conversion Leak Hunter"}','2026-09-29T13:48:43.868Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_4e4cdb0e-6069-4320-ab81-ef1d019a8a69','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_410cdeae-472a-4fb0-bfe4-beec328aef39','page_view','/pages/reviews/reviews','https://revenue-leak-hunter.pages.dev/pages/services/services','{"title":"Client Reviews | Conversion Leak Hunter"}','2026-09-29T13:49:03.259Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_ef57fefd-b7bf-41e1-be01-97e87d755b6d','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_410cdeae-472a-4fb0-bfe4-beec328aef39','page_view','/pages/reviews/reviews','https://revenue-leak-hunter.pages.dev/pages/services/services','{"title":"Client Reviews | Conversion Leak Hunter"}','2026-09-29T13:49:14.754Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_a40ea51b-6735-428f-8478-8e9b92a705d8','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_1f71bed4-9ca4-420d-8627-e296709e4c6b','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-29T16:03:47.453Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_02ed296f-63e6-45f4-8308-24e36b4f6fb5','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_6ab8d49f-1bd7-466b-b735-061099d68e2d','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T08:21:33.314Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_88c59864-2ee9-43fc-a12b-11c1042839c1','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_6ab8d49f-1bd7-466b-b735-061099d68e2d','page_view','/pages/portfolio/portfolio','https://revenue-leak-hunter.pages.dev/','{"title":"portfolio | Conversion Leak Hunter"}','2026-09-30T08:21:36.227Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_33a6a3a1-1325-45ef-b8b2-fbc60e361b8d','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_6ab8d49f-1bd7-466b-b735-061099d68e2d','article_view','/pages/portfolio/portfolio','https://revenue-leak-hunter.pages.dev/','{"title":"portfolio | Conversion Leak Hunter"}','2026-09-30T08:21:36.228Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_ee10739a-825a-4d48-888b-c3c222fa8864','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_6ab8d49f-1bd7-466b-b735-061099d68e2d','article_view','/pages/portfolio/portfolio','https://revenue-leak-hunter.pages.dev/','{"title":"portfolio | Conversion Leak Hunter"}','2026-09-30T08:31:15.041Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_637c078d-1d9d-4a84-993d-4bd65a64255d','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_6ab8d49f-1bd7-466b-b735-061099d68e2d','page_view','/pages/portfolio/portfolio','https://revenue-leak-hunter.pages.dev/','{"title":"portfolio | Conversion Leak Hunter"}','2026-09-30T08:31:15.045Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_bc8c1c57-a55b-4e59-aa7c-3c6e1b89991e','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_b82be96f-f284-4420-9e11-ec550e89edac','page_view','/pages/portfolio/portfolio','https://revenue-leak-hunter.pages.dev/','{"title":"portfolio | Conversion Leak Hunter"}','2026-09-30T09:18:11.790Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_7f08d5a0-bf9d-41dc-858d-429e2e76c067','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_b82be96f-f284-4420-9e11-ec550e89edac','article_view','/pages/portfolio/portfolio','https://revenue-leak-hunter.pages.dev/','{"title":"portfolio | Conversion Leak Hunter"}','2026-09-30T09:18:11.792Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_a07a9542-4a6f-4044-875e-dbe761ebbe0b','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_b82be96f-f284-4420-9e11-ec550e89edac','article_view','/pages/portfolio/portfolio','https://revenue-leak-hunter.pages.dev/','{"title":"portfolio | Conversion Leak Hunter"}','2026-09-30T09:44:28.838Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_b8871a32-494d-4776-8272-befee650d1bd','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_b82be96f-f284-4420-9e11-ec550e89edac','page_view','/pages/portfolio/portfolio','https://revenue-leak-hunter.pages.dev/','{"title":"portfolio | Conversion Leak Hunter"}','2026-09-30T09:44:28.840Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_85fa21d6-92bc-421d-b666-78fe64cee712','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_447e110a-70f4-4f3e-be73-a45c79c9aa3f','article_view','/pages/portfolio/portfolio','https://revenue-leak-hunter.pages.dev/','{"title":"portfolio | Conversion Leak Hunter"}','2026-09-30T10:31:34.903Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_a1356ffb-f0de-4865-9174-b3ecc33f3267','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_447e110a-70f4-4f3e-be73-a45c79c9aa3f','page_view','/pages/portfolio/portfolio','https://revenue-leak-hunter.pages.dev/','{"title":"portfolio | Conversion Leak Hunter"}','2026-09-30T10:31:34.908Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_0fa3df7a-2cd7-432f-8b13-f7c60f7eb02c','v_7d38f195-120f-4a8f-9dc1-9c79d097ce17','s_84066aad-40d9-4559-9400-38d1b24c53bb','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T10:48:30.543Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_26abacf2-72cd-46b9-bd3c-e3c65e5322e4','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_f914d113-ff47-47ac-bb6d-05b166d29c7a','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T10:49:25.212Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_57fa357a-268d-404a-b2a7-8e648cd78110','v_c3f7c3e2-67c3-4c58-9bc4-cff9e084a2bb','s_12e64392-5031-4382-b627-3576d03fea67','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T10:56:51.988Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_13e018a1-0227-4f7f-a954-3b4e22489031','v_e9d71273-3f48-41d0-aa6c-ad9811c93cbb','s_2384b700-6079-4066-bfe5-755105525f0a','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T10:56:59.523Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_c16fa723-8375-4bcb-bf5a-4f36eaea0e29','v_8475ccc7-9789-4ff5-a946-b6c11bbfbfb0','s_6149e5fd-dbdb-48c6-a9e5-722348760aed','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T11:13:39.133Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_2d6b3ebe-1c67-41de-8bd8-8b88dc908d26','v_f09e8d22-2b9d-4ae4-8d8b-cace4d426cb3','s_fa537cb1-e2cb-4eb6-bfa9-11868e58d7e7','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T11:38:21.038Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_c0318ddc-586f-4f9c-b4b3-df25fab43f90','v_f09e8d22-2b9d-4ae4-8d8b-cace4d426cb3','s_fa537cb1-e2cb-4eb6-bfa9-11868e58d7e7','cta_click','/',NULL,'{"label":"Begin Investigation\n                    →"}','2026-09-30T11:38:28.579Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_4c730c44-3397-4754-818d-df30e4830b76','v_f09e8d22-2b9d-4ae4-8d8b-cace4d426cb3','s_fa537cb1-e2cb-4eb6-bfa9-11868e58d7e7','page_view','/','https://leakendia.com/pages/contact/contact','{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T11:38:35.104Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_a3f09e73-761c-4641-aaec-527dd0469fd4','v_f09e8d22-2b9d-4ae4-8d8b-cace4d426cb3','s_fa537cb1-e2cb-4eb6-bfa9-11868e58d7e7','page_view','/pages/blog/blog','https://leakendia.com/','{"title":"Blog | Conversion Leak Hunter"}','2026-09-30T11:38:42.767Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_755bae8b-81df-48db-9671-63f4bb2abdb5','v_f09e8d22-2b9d-4ae4-8d8b-cace4d426cb3','s_fa537cb1-e2cb-4eb6-bfa9-11868e58d7e7','page_view','/articles/silent-conversion-leaks/article','https://leakendia.com/pages/blog/blog','{"title":"The 7 Silent Conversion Leaks That Make Good Businesses Look Broken | Conversion Leak Hunter"}','2026-09-30T11:38:48.168Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_a613b7c5-7948-4765-ad58-731714f456df','v_f09e8d22-2b9d-4ae4-8d8b-cace4d426cb3','s_fa537cb1-e2cb-4eb6-bfa9-11868e58d7e7','article_view','/articles/silent-conversion-leaks/article','https://leakendia.com/pages/blog/blog','{"title":"The 7 Silent Conversion Leaks That Make Good Businesses Look Broken | Conversion Leak Hunter"}','2026-09-30T11:38:48.176Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_4ef992a0-669f-4781-93b6-7040aadfba62','v_f09e8d22-2b9d-4ae4-8d8b-cace4d426cb3','s_fa537cb1-e2cb-4eb6-bfa9-11868e58d7e7','external_link_click','/pages/blog/blog','https://leakendia.com/','{"destination_host":"www.linkedin.com"}','2026-09-30T11:39:45.356Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_979e5012-57ed-4b62-b521-ab966cf85043','v_3b567efb-181b-4310-8a93-9a92d0261dda','s_a9432d33-3459-4676-929f-d073c176b0ed','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T11:45:55.141Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_c3e08515-3763-419e-b327-1c2e4fc80538','v_bc3e7104-a990-4f2f-a378-eb04d6872078','s_c5b82dc1-f122-4c51-814e-883f859fa850','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T12:00:04.656Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_ddd71dc2-84cc-4397-b153-f2fcc9bf726c','v_bc3e7104-a990-4f2f-a378-eb04d6872078','s_c5b82dc1-f122-4c51-814e-883f859fa850','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T12:00:18.399Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_d2563e2e-c891-4a11-930a-2af552d82992','v_dba8b04f-997e-4f44-b08a-65ec6c1cdb99','s_7091a294-be03-49bb-bcc3-0640d6e49c98','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T12:00:29.815Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_506d1f75-c189-40c1-9d7b-345e46bd4c16','v_bc3e7104-a990-4f2f-a378-eb04d6872078','s_aca6fa28-c36f-4d48-b1f4-ce0c87f9cfbc','page_view','/','https://www.google.com/','{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T12:01:05.869Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_d8200f1e-b3e8-49a0-98a5-07a0c4a32584','v_bc3e7104-a990-4f2f-a378-eb04d6872078','s_aca6fa28-c36f-4d48-b1f4-ce0c87f9cfbc','page_view','/pages/services/services','https://leakendia.com/','{"title":"Services | Conversion Leak Hunter"}','2026-09-30T12:01:20.912Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_caf5fdaf-cd10-480b-9463-dd50633e69a8','v_e24c7745-453b-487a-8534-c5dd8026dacc','s_d4f23014-b049-4457-9b51-982a345645d7','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T12:01:39.247Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_cefe5893-0a07-4b6c-975e-b1ed21b53d0b','v_f09e8d22-2b9d-4ae4-8d8b-cace4d426cb3','s_7a3ce8e5-2808-4380-ac69-1b1e97929422','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T12:03:11.437Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_d9a647c4-5d13-443a-84e7-7ddb65d3ab78','v_705e00ee-5654-46dc-93e6-b15cc39ef780','s_29ce51e6-de53-4e90-b8e8-f01deeeb8175','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T12:03:25.096Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_586d61de-876b-421f-a77e-44a5d982738f','v_aa626074-5e57-4403-a1f8-a6f4d7916a0e','s_9ddf6114-135d-45d6-b2b3-22a811f0672b','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T12:07:54.064Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_18372a5a-b3a8-4426-8cb4-d2f5c932e781','v_aa626074-5e57-4403-a1f8-a6f4d7916a0e','s_9ddf6114-135d-45d6-b2b3-22a811f0672b','external_link_click','/',NULL,'{"destination_host":""}','2026-09-30T12:07:58.710Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_099ca127-7902-4c00-b22f-b6911eb377fc','v_aa626074-5e57-4403-a1f8-a6f4d7916a0e','s_9ddf6114-135d-45d6-b2b3-22a811f0672b','cta_click','/',NULL,'{"label":"Contact Me"}','2026-09-30T12:08:21.263Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_b4e4eb77-82a2-4148-ae81-28379bedc16e','v_aa626074-5e57-4403-a1f8-a6f4d7916a0e','s_9ddf6114-135d-45d6-b2b3-22a811f0672b','page_view','/','https://leakendia.com/pages/contact/contact','{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T12:08:26.482Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_33467bbb-7217-43c1-8698-4c0a485172d2','v_aa626074-5e57-4403-a1f8-a6f4d7916a0e','s_9ddf6114-135d-45d6-b2b3-22a811f0672b','article_view','/pages/terms/terms','https://leakendia.com/','{"title":"Terms of Service | Conversion Leak Hunter"}','2026-09-30T12:08:35.464Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_ef22c1ec-e8b4-4000-869f-5a21481c678b','v_aa626074-5e57-4403-a1f8-a6f4d7916a0e','s_9ddf6114-135d-45d6-b2b3-22a811f0672b','page_view','/pages/terms/terms','https://leakendia.com/','{"title":"Terms of Service | Conversion Leak Hunter"}','2026-09-30T12:08:35.444Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_8a45f676-1923-458e-b6e1-030a5b53b2ec','v_66157f4f-3056-4f9b-bd5e-8bfeeb081e56','s_e4eb177c-2f1c-413e-bb70-5b1cdb5750a3','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T12:08:36.582Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_f9b2c012-c191-480d-9842-0a8a7c61ec7b','v_aa626074-5e57-4403-a1f8-a6f4d7916a0e','s_9ddf6114-135d-45d6-b2b3-22a811f0672b','external_link_click','/pages/terms/terms','https://leakendia.com/','{"destination_host":""}','2026-09-30T12:08:41.190Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_509990cf-ed5f-45f6-a50a-889982324bec','v_aa626074-5e57-4403-a1f8-a6f4d7916a0e','s_9ddf6114-135d-45d6-b2b3-22a811f0672b','external_link_click','/pages/terms/terms','https://leakendia.com/','{"destination_host":""}','2026-09-30T12:08:58.871Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_ea81ce63-beac-4dbb-9643-6f01970c6ce9','v_337cfd6d-2f18-4b05-a6e3-162dd0673aa3','s_7842e842-47db-46e0-a2a5-a0b6fbe925c0','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T12:30:34.820Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_965e2024-aee1-4ff2-92ad-8900330baf79','v_a43cbe5c-e26c-4993-8a42-eb72a40d87a2','s_d83340e2-3490-45cb-ac69-cf8afccdc495','page_view','/','https://www.google.com/','{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T12:42:21.156Z');
INSERT INTO "analytics_events" ("event_id","visitor_id","session_id","event_type","page","referrer","metadata","created_at") VALUES('e_c955fb49-53c1-477d-828b-3634634de734','v_168ad72a-cc21-4c47-9013-6b029c28e3a5','s_9a56ca04-a49a-4c9c-80e6-f1e9fb798890','page_view','/',NULL,'{"title":"Precious | Conversion Leak Hunter"}','2026-09-30T13:55:17.274Z');
CREATE TABLE analytics_v2_sessions (
 session_id TEXT PRIMARY KEY, visitor_id TEXT NOT NULL,
 started_at TEXT NOT NULL, last_seen_at TEXT NOT NULL,
 landing_page TEXT NOT NULL, last_page TEXT NOT NULL,
 source TEXT NOT NULL DEFAULT 'direct', medium TEXT NOT NULL DEFAULT 'none',
 campaign TEXT NOT NULL DEFAULT '', referrer TEXT NOT NULL DEFAULT '',
 device TEXT NOT NULL DEFAULT 'unknown', internal INTEGER NOT NULL DEFAULT 0,
 UNIQUE(session_id, visitor_id)
);
INSERT INTO "analytics_v2_sessions" ("session_id","visitor_id","started_at","last_seen_at","landing_page","last_page","source","medium","campaign","referrer","device","internal") VALUES('s_5df0fc16-6be7-4ae2-b639-302422518a2a','v_a43cbe5c-e26c-4993-8a42-eb72a40d87a2','2026-09-30T14:22:38.209Z','2026-09-30T14:24:30.930Z','/','/pages/blog/blog','www.google.com','referral','','www.google.com','unknown',0);
CREATE TABLE analytics_v2_events (
 event_id TEXT PRIMARY KEY, session_id TEXT NOT NULL, visitor_id TEXT NOT NULL,
 event_type TEXT NOT NULL, page TEXT NOT NULL, occurred_at TEXT NOT NULL,
 received_at TEXT NOT NULL, metadata TEXT NOT NULL DEFAULT '{}',
 FOREIGN KEY(session_id, visitor_id) REFERENCES analytics_v2_sessions(session_id, visitor_id) ON DELETE CASCADE
);
INSERT INTO "analytics_v2_events" ("event_id","session_id","visitor_id","event_type","page","occurred_at","received_at","metadata") VALUES('e_59bd53b9-b85d-4871-9089-25b7ac03a982','s_5df0fc16-6be7-4ae2-b639-302422518a2a','v_a43cbe5c-e26c-4993-8a42-eb72a40d87a2','page_view','/','2026-09-30T14:22:38.209Z','2026-09-30T14:22:38.209Z','{}');
INSERT INTO "analytics_v2_events" ("event_id","session_id","visitor_id","event_type","page","occurred_at","received_at","metadata") VALUES('e_873846d2-272a-492d-852d-2dc61dc42b2a','s_5df0fc16-6be7-4ae2-b639-302422518a2a','v_a43cbe5c-e26c-4993-8a42-eb72a40d87a2','page_view','/pages/reviews/reviews','2026-09-30T14:22:43.649Z','2026-09-30T14:22:43.649Z','{}');
INSERT INTO "analytics_v2_events" ("event_id","session_id","visitor_id","event_type","page","occurred_at","received_at","metadata") VALUES('e_e08ffd2e-0bef-42ef-a701-02a082632d27','s_5df0fc16-6be7-4ae2-b639-302422518a2a','v_a43cbe5c-e26c-4993-8a42-eb72a40d87a2','external_link_click','/pages/reviews/reviews','2026-09-30T14:22:50.835Z','2026-09-30T14:22:50.835Z','{}');
INSERT INTO "analytics_v2_events" ("event_id","session_id","visitor_id","event_type","page","occurred_at","received_at","metadata") VALUES('e_6fde0f58-e912-465a-8158-508c5e5ab843','s_5df0fc16-6be7-4ae2-b639-302422518a2a','v_a43cbe5c-e26c-4993-8a42-eb72a40d87a2','external_link_click','/pages/reviews/reviews','2026-09-30T14:22:53.904Z','2026-09-30T14:22:53.904Z','{}');
INSERT INTO "analytics_v2_events" ("event_id","session_id","visitor_id","event_type","page","occurred_at","received_at","metadata") VALUES('e_fdd89a26-3b27-4fca-a27c-1289a982b9df','s_5df0fc16-6be7-4ae2-b639-302422518a2a','v_a43cbe5c-e26c-4993-8a42-eb72a40d87a2','external_link_click','/pages/reviews/reviews','2026-09-30T14:22:55.205Z','2026-09-30T14:22:55.205Z','{}');
INSERT INTO "analytics_v2_events" ("event_id","session_id","visitor_id","event_type","page","occurred_at","received_at","metadata") VALUES('e_b7c8b1f6-9b75-48dd-9da7-27ac2cd72ea8','s_5df0fc16-6be7-4ae2-b639-302422518a2a','v_a43cbe5c-e26c-4993-8a42-eb72a40d87a2','external_link_click','/pages/reviews/reviews','2026-09-30T14:22:57.381Z','2026-09-30T14:22:57.381Z','{}');
INSERT INTO "analytics_v2_events" ("event_id","session_id","visitor_id","event_type","page","occurred_at","received_at","metadata") VALUES('e_233281cd-781a-4670-ae7b-6284c4289973','s_5df0fc16-6be7-4ae2-b639-302422518a2a','v_a43cbe5c-e26c-4993-8a42-eb72a40d87a2','external_link_click','/pages/reviews/reviews','2026-09-30T14:22:57.526Z','2026-09-30T14:22:57.526Z','{}');
INSERT INTO "analytics_v2_events" ("event_id","session_id","visitor_id","event_type","page","occurred_at","received_at","metadata") VALUES('e_6c41eed7-43c9-4364-8414-bd5cbf14dedb','s_5df0fc16-6be7-4ae2-b639-302422518a2a','v_a43cbe5c-e26c-4993-8a42-eb72a40d87a2','external_link_click','/pages/reviews/reviews','2026-09-30T14:23:01.339Z','2026-09-30T14:23:01.339Z','{}');
INSERT INTO "analytics_v2_events" ("event_id","session_id","visitor_id","event_type","page","occurred_at","received_at","metadata") VALUES('e_9c53dfea-8b76-4f84-a5f2-16ebf0f9bbf9','s_5df0fc16-6be7-4ae2-b639-302422518a2a','v_a43cbe5c-e26c-4993-8a42-eb72a40d87a2','page_view','/pages/blog/blog','2026-09-30T14:23:10.961Z','2026-09-30T14:23:10.961Z','{}');
INSERT INTO "analytics_v2_events" ("event_id","session_id","visitor_id","event_type","page","occurred_at","received_at","metadata") VALUES('e_66f6acbb-ccef-4681-887e-bf3ab2b7c79e','s_5df0fc16-6be7-4ae2-b639-302422518a2a','v_a43cbe5c-e26c-4993-8a42-eb72a40d87a2','cta_click','/pages/blog/blog','2026-09-30T14:24:30.930Z','2026-09-30T14:24:30.930Z','{}');
CREATE TABLE analytics_v2_leads (
 lead_id TEXT PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
 session_id TEXT, visitor_id TEXT, form_id TEXT NOT NULL DEFAULT '', attempt_id TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL, stage TEXT NOT NULL DEFAULT 'enquiry'
 CHECK(stage IN ('enquiry','qualified','proposal','won','lost')),
 updated_at TEXT NOT NULL,
 FOREIGN KEY(session_id, visitor_id) REFERENCES analytics_v2_sessions(session_id, visitor_id) ON DELETE SET NULL
);
CREATE TABLE analytics_v2_rate_limits (
 bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL
);
INSERT INTO "analytics_v2_rate_limits" ("bucket","count","expires_at") VALUES('ed6531a3201a208d9ecc6cc09d08855b67db0c69019708ecb44b6fe247ad3e9f',7,1790778240);
INSERT INTO "analytics_v2_rate_limits" ("bucket","count","expires_at") VALUES('8c0d360b5cd081e8f8483805a024bf990fe1a410226d30a6eb60848a86061b64',2,1790778300);
INSERT INTO "analytics_v2_rate_limits" ("bucket","count","expires_at") VALUES('fab0c96823736bd42f65dd517ddb3244e0ba9d9ab22258ef7ff6d90a03ce96a9',1,1790778360);
CREATE INDEX idx_conversations_client
ON conversations(client_id);
CREATE INDEX idx_messages_conversation
ON messages(conversation_id);
CREATE INDEX idx_sessions_client
ON sessions(client_id);
CREATE INDEX idx_comments_article
ON blog_comments(article_slug);
CREATE INDEX idx_notifications_client
ON notifications(client_id);
CREATE INDEX idx_admin_sessions_expires
ON admin_sessions(expires_at);
CREATE INDEX idx_files_client
ON files(client_id);
CREATE INDEX idx_files_conversation
ON files(conversation_id);
CREATE INDEX idx_files_message
ON files(message_id);
CREATE INDEX idx_attachments_message
ON attachments(message_id);
CREATE INDEX idx_attachments_conversation
ON attachments(conversation_id);
CREATE INDEX idx_attachments_client
ON attachments(client_id);
CREATE INDEX idx_analytics_events_created_at
ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_visitor
ON analytics_events(visitor_id, created_at DESC);
CREATE INDEX idx_analytics_events_session
ON analytics_events(session_id, created_at ASC);
CREATE INDEX idx_analytics_events_type
ON analytics_events(event_type, created_at DESC);
CREATE INDEX idx_analytics_sessions_visitor
ON analytics_sessions(visitor_id, started_at DESC);
CREATE INDEX av2_sessions_start ON analytics_v2_sessions(started_at, internal);
CREATE INDEX av2_sessions_visitor ON analytics_v2_sessions(visitor_id, started_at);
CREATE INDEX av2_events_session ON analytics_v2_events(session_id, occurred_at, event_id);
CREATE INDEX av2_events_received ON analytics_v2_events(received_at);
CREATE INDEX av2_leads_session ON analytics_v2_leads(session_id, created_at);
CREATE INDEX av2_leads_created ON analytics_v2_leads(created_at);
CREATE INDEX av2_rate_expiry ON analytics_v2_rate_limits(expires_at);
CREATE TRIGGER av2_event_updates_session AFTER INSERT ON analytics_v2_events
BEGIN
 UPDATE analytics_v2_sessions SET
  landing_page = CASE WHEN NEW.occurred_at < started_at THEN NEW.page ELSE landing_page END,
  last_page = CASE WHEN NEW.occurred_at >= last_seen_at THEN NEW.page ELSE last_page END,
  started_at = MIN(started_at, NEW.occurred_at),
  last_seen_at = MAX(last_seen_at, NEW.occurred_at)
 WHERE session_id = NEW.session_id;
END;
CREATE TRIGGER av2_event_identity_guard BEFORE INSERT ON analytics_v2_events
WHEN EXISTS (SELECT 1 FROM analytics_v2_events WHERE event_id=NEW.event_id AND (session_id!=NEW.session_id OR visitor_id!=NEW.visitor_id))
BEGIN
 SELECT RAISE(ABORT, 'analytics event identity constraint');
END;
