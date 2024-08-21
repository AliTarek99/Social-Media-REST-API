CREATE TABLE Notifications(
    id INTEGER NOT NULL,
    recipientId BIGINT NOT NULL,
    activity_type TEXT NOT NULL,
    object_type TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    senderId BIGINT NULL,
    not_read BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT NULL,
    objectId BIGINT
);
ALTER TABLE
    Notifications ADD PRIMARY KEY(recipientId, id);

CREATE TABLE Posts(
    id BIGINT AUTO_INCREMENT UNIQUE,
    caption TEXT NULL,
    media_HD VARCHAR(100) NULL,
    media_SD VARCHAR(100) NULL,
    repostedId BIGINT NULL,
    creatorId BIGINT NOT NULL,
    post_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    num_of_likes INTEGER NOT NULL DEFAULT 0,
    num_of_comments INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE
    Posts ADD PRIMARY KEY(creatorId, id);

CREATE INDEX posts_id_index ON
    Posts(id);

CREATE TABLE User_post_rel(
    userId BIGINT NOT NULL,
    postId BIGINT NOT NULL,
    liked Boolean NOT NULL DEFAULT FALSE,
    saved Boolean NOT NULL DEFAULT FALSE
);
ALTER TABLE
    User_post_rel ADD PRIMARY KEY(liked, postId, userId);

CREATE INDEX saved_posts_index ON
    User_post_rel(userId, postId, saved);

CREATE TABLE Support(
    id INTEGER AUTO_INCREMENT UNIQUE,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(36) NOT NULL,
    name VARCHAR(36) NOT NULL,
    num_of_reviewed_reports INTEGER NOT NULL DEFAULT 0,
    admin BOOLEAN NOT NULL DEFAULT FALSE,
    verified BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX support_email_index ON
    Support(email, password);

CREATE INDEX support_verified_index ON
    Support(verified);

CREATE INDEX support_name_index ON
    Support(name);

ALTER TABLE
    Support ADD PRIMARY KEY(id);

CREATE TABLE Reports(
    id INTEGER AUTO_INCREMENT UNIQUE,
    userId BIGINT NOT NULL,
    supportId INTEGER NULL,
    description TEXT NOT NULL,
    postId BIGINT NOT NULL,
    commentId INTEGER NULL,
    assigned BOOLEAN NOT NULL DEFAULT FALSE
);
ALTER TABLE
    Reports ADD PRIMARY KEY(supportId, id);

CREATE INDEX reports_userid_postid_commentid_index ON
    Reports(userId, postId, commentId);
CREATE INDEX reports_assigned_id_index ON
    Reports(assigned, id);

CREATE TABLE Followers(
    userId BIGINT NOT NULL,
    followerId BIGINT NOT NULL
);
CREATE INDEX followers_userid_index ON
    Followers(userId);
ALTER TABLE
    Followers ADD PRIMARY KEY(followerId, userId);

CREATE TABLE Messages(
    id INTEGER NOT NULL,
    senderId BIGINT NOT NULL,
    chatId BIGINT NOT NULL,
    text TEXT NULL,
    media VARCHAR(36) NULL,
    is_call BOOLEAN NOT NULL,
    received BOOLEAN NOT NULL DEFAULT FALSE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE
    Messages ADD PRIMARY KEY(chatId, id);

CREATE INDEX messages_recipientid_received_id_index ON
    Messages(id, chatId);

CREATE INDEX messages_id_senderid_recipientid_index ON
    Messages (received, chatId);

CREATE TABLE Chats(
   id BIGINT AUTO_INCREMENT UNIQUE,
   num_of_msgs INTEGER DEFAULT 0,
   last_message INTEGER,
   last_message_date TIMESTAMP 
);

ALTER TABLE
    Chats ADD PRIMARY KEY(id);

CREATE INDEX chats_last_message_date_index ON
    Chats(last_message_date);

CREATE TABLE Chat_members(
   id BIGINT,
   userId BIGINT
);

ALTER TABLE
    Chat_members ADD PRIMARY KEY(userId, id);

CREATE INDEX chats_members_userId_id_index ON
    Chat_members(id, userId);


CREATE TABLE User_metadata(
    id BIGINT NOT NULL,
    num_of_warnings SMALLINT NOT NULL DEFAULT 0,
    num_of_notifications INTEGER NOT NULL DEFAULT 0,
    email VARCHAR(254) NOT NULL,
    password VARCHAR(254) NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_code INTEGER NULL,
    reset_password_token VARCHAR(100) NULL
);
CREATE INDEX user_metadata_email_index ON
    User_metadata(email, password, email_verified);
ALTER TABLE
    User_metadata ADD PRIMARY KEY(id);

CREATE TABLE Comments(
    id INTEGER NOT NULL,
    creatorId BIGINT NOT NULL,
    postId BIGINT NOT NULL,
    text TEXT NOT NULL,
    media VARCHAR(36) NULL,
    num_of_children INTEGER NOT NULL DEFAULT 0,
    type_of_parent VARCHAR(8) NOT NULL,
    parent INTEGER NULL
);
ALTER TABLE
    Comments ADD PRIMARY KEY(
        postId,
        type_of_parent,
        parent,
        id
    );

CREATE INDEX comments_postId_id_index ON
    Comments(postId, id);

CREATE TABLE Users(
    id BIGINT AUTO_INCREMENT UNIQUE,
    profile_pic VARCHAR(36) NOT NULL,
    name VARCHAR(36) NOT NULL,
    bio VARCHAR(1023) NULL,
    number_of_followers INTEGER NOT NULL DEFAULT 0,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    number_of_followed INTEGER NOT NULL DEFAULT 0,
    banned BOOLEAN NOT NULL DEFAULT FALSE,
    suspended BOOLEAN NOT NULL DEFAULT FALSE
);
ALTER TABLE
    Users ADD PRIMARY KEY(id);
CREATE INDEX users_name_index ON
    Users(name);

ALTER TABLE
    User_post_rel ADD CONSTRAINT User_post_rel_userid_foreign FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Messages ADD CONSTRAINT messages_senderid_foreign FOREIGN KEY(senderId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Notifications ADD CONSTRAINT notifications_senderid_foreign FOREIGN KEY(senderId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Notifications ADD CONSTRAINT notifications_recipientid_foreign FOREIGN KEY(recipientId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Reports ADD CONSTRAINT reports_supportid_foreign FOREIGN KEY(SupportId) REFERENCES Support(id) ON DELETE CASCADE;
ALTER TABLE
    Followers ADD CONSTRAINT followers_userid_foreign FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    User_metadata ADD CONSTRAINT users_id_foreign FOREIGN KEY(id) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    User_post_rel ADD CONSTRAINT User_post_rel_postid_foreign FOREIGN KEY(postId) REFERENCES Posts(id) ON DELETE CASCADE;
ALTER TABLE
    Comments ADD CONSTRAINT comments_postid_foreign FOREIGN KEY(postId) REFERENCES Posts(id) ON DELETE CASCADE;
ALTER TABLE
    Reports ADD CONSTRAINT reports_postid_foreign FOREIGN KEY(postId) REFERENCES Posts(id) ON DELETE CASCADE;
ALTER TABLE
    Messages ADD CONSTRAINT messages_chatid_foreign FOREIGN KEY(chatId) REFERENCES Chats(id) ON DELETE CASCADE;
ALTER TABLE
    Reports ADD CONSTRAINT reports_userid_foreign FOREIGN KEY(UserId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Posts ADD CONSTRAINT posts_creatorid_foreign FOREIGN KEY(creatorId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Posts ADD CONSTRAINT posts_repostedid_foreign FOREIGN KEY(repostedId) REFERENCES Posts(id) ON DELETE CASCADE;
ALTER TABLE
    Followers ADD CONSTRAINT followers_followerid_foreign FOREIGN KEY(followerId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Comments ADD CONSTRAINT comments_creatorid_foreign FOREIGN KEY(creatorId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Chats ADD CONSTRAINT chats_last_message_foreign FOREIGN KEY(last_message) REFERENCES Messages(id);
ALTER TABLE
    Chat_members ADD CONSTRAINT chat_members_id_foreign FOREIGN KEY(id) REFERENCES Chats(id) ON DELETE CASCADE;
ALTER TABLE
    Chat_members ADD CONSTRAINT chat_members_userid_foreign FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE;