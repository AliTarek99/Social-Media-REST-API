CREATE TABLE Notifications(
    id INTEGER NOT NULL,
    recipientId BIGINT NOT NULL,
    activity_type TEXT NOT NULL,
    object_type TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    senderId BIGINT NULL,
    not_read BOOLEAN NOT NULL,
    description TEXT NULL
);
ALTER TABLE
    Notifications ADD PRIMARY KEY(recipientId, not_read, id);

CREATE TABLE Posts(
    id BIGINT AUTO_INCREMENT UNIQUE,
    caption TEXT NULL,
    media VARCHAR(36) NULL,
    repostedId BIGINT NULL,
    creatorId BIGINT NOT NULL,
    post_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    num_of_likes INTEGER NOT NULL,
    num_of_comments INTEGER NOT NULL
);
ALTER TABLE
    Posts ADD PRIMARY KEY(creatorId, id);

CREATE INDEX posts_id_index ON
    Posts(id);

CREATE TABLE Likes(
    userId BIGINT NOT NULL,
    postId BIGINT NOT NULL
);
ALTER TABLE
    Likes ADD PRIMARY KEY(postId, userId);

CREATE TABLE Support(
    id INTEGER AUTO_INCREMENT UNIQUE,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(36) NOT NULL,
    name VARCHAR(36) NOT NULL,
    num_of_reviewed_reports INTEGER NOT NULL,
    admin BOOLEAN NOT NULL,
    verified BOOLEAN NOT NULL
);
CREATE INDEX support_email_index ON
    Support(email, password);

ALTER TABLE
    Support ADD PRIMARY KEY(id);

CREATE TABLE Reports(
    id INTEGER AUTO_INCREMENT UNIQUE,
    UserId BIGINT NOT NULL,
    SupportId INTEGER NOT NULL,
    Description TEXT NOT NULL,
    postId BIGINT NOT NULL,
    commentId INTEGER NULL,
    assigned BOOLEAN NOT NULL
);
ALTER TABLE
    Reports ADD PRIMARY KEY(SupportId, id);

CREATE INDEX reports_userid_postid_commentid_index ON
    Reports(UserId, postId, commentId);
CREATE INDEX reports_assigned_id_index ON
    Reports(assigned, id);

CREATE TABLE Follwers(
    userId BIGINT NOT NULL,
    followerId BIGINT NOT NULL
);
CREATE INDEX follwers_userid_index ON
    Follwers(userId);
ALTER TABLE
    Follwers ADD PRIMARY KEY(followerId, userId);

CREATE TABLE Messages(
    id INTEGER NOT NULL,
    senderId BIGINT NOT NULL,
    recipientId BIGINT NOT NULL,
    text TEXT NULL,
    media VARCHAR(36) NULL,
    is_call BOOLEAN NULL,
    received BOOLEAN NOT NULL,
    is_read BOOLEAN NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE
    Messages ADD PRIMARY KEY(senderId, recipientId, id);

CREATE INDEX messages_recipientid_received_id_index ON
    Messages(recipientId, received, id);

CREATE TABLE User_metadata(
    id BIGINT NOT NULL,
    num_of_warnings SMALLINT NOT NULL,
    num_of_notifications INTEGER NOT NULL,
    email VARCHAR(254) NOT NULL,
    password VARCHAR(254) NULL,
    email_verified BOOLEAN NOT NULL
);
CREATE INDEX user_metadata_email_index ON
    User_metadata(email, password);
ALTER TABLE
    User_metadata ADD PRIMARY KEY(id);

CREATE TABLE Comments(
    id INTEGER NOT NULL,
    creatorId BIGINT NOT NULL,
    postId BIGINT NOT NULL,
    text TEXT NOT NULL,
    media VARCHAR(36) NULL,
    num_of_children INTEGER NOT NULL,
    type_of_parent VARCHAR(8) NOT NULL,
    parent INTEGER NULL
);
ALTER TABLE
    Comments ADD PRIMARY KEY(
        postId,
        type_of_parent(8),
        parent,
        id
    );

CREATE TABLE Users(
    id BIGINT AUTO_INCREMENT UNIQUE,
    profile_pic VARCHAR(36) NOT NULL,
    name VARCHAR(36) NOT NULL,
    bio VARCHAR(1023) NULL,
    number_of_followers INTEGER NOT NULL,
    verified BOOLEAN NOT NULL,
    number_of_followed INTEGER NOT NULL,
    banned BOOLEAN NOT NULL,
    suspended BOOLEAN NOT NULL
);
ALTER TABLE
    Users ADD PRIMARY KEY(id);

CREATE TABLE Saved_Posts(
    userId BIGINT NOT NULL,
    postId BIGINT NOT NULL
);
ALTER TABLE
    Saved_Posts ADD PRIMARY KEY(userId, postId);

ALTER TABLE
    Likes ADD CONSTRAINT likes_userid_foreign FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Messages ADD CONSTRAINT messages_senderid_foreign FOREIGN KEY(senderId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Notifications ADD CONSTRAINT notifications_senderid_foreign FOREIGN KEY(senderId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Notifications ADD CONSTRAINT notifications_recipientid_foreign FOREIGN KEY(recipientId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Reports ADD CONSTRAINT reports_supportid_foreign FOREIGN KEY(SupportId) REFERENCES Support(id) ON DELETE CASCADE;
ALTER TABLE
    Follwers ADD CONSTRAINT follwers_userid_foreign FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    User_metadata ADD CONSTRAINT users_id_foreign FOREIGN KEY(id) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Likes ADD CONSTRAINT likes_postid_foreign FOREIGN KEY(postId) REFERENCES Posts(id) ON DELETE CASCADE;
ALTER TABLE
    Comments ADD CONSTRAINT comments_postid_foreign FOREIGN KEY(postId) REFERENCES Posts(id) ON DELETE CASCADE;
ALTER TABLE
    Saved_Posts ADD CONSTRAINT saved_posts_userid_foreign FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Reports ADD CONSTRAINT reports_postid_foreign FOREIGN KEY(postId) REFERENCES Posts(id) ON DELETE CASCADE;
ALTER TABLE
    Messages ADD CONSTRAINT messages_recipientid_foreign FOREIGN KEY(recipientId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Reports ADD CONSTRAINT reports_userid_foreign FOREIGN KEY(UserId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Posts ADD CONSTRAINT posts_creatorid_foreign FOREIGN KEY(creatorId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Posts ADD CONSTRAINT posts_repostedid_foreign FOREIGN KEY(repostedId) REFERENCES Posts(id) ON DELETE CASCADE;
ALTER TABLE
    Follwers ADD CONSTRAINT follwers_followerid_foreign FOREIGN KEY(followerId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Comments ADD CONSTRAINT comments_creatorid_foreign FOREIGN KEY(creatorId) REFERENCES Users(id) ON DELETE CASCADE;
ALTER TABLE
    Saved_Posts ADD CONSTRAINT saved_posts_postid_foreign FOREIGN KEY(postId) REFERENCES Posts(id) ON DELETE CASCADE;
