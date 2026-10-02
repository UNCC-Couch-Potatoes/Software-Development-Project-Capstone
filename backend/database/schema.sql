-- For the Resources page
CREATE TABLE IF NOT EXISTS Resources (
    ResourceID BIGINT NOT NULL AUTO_INCREMENT,
    SiteName VARCHAR(255) NOT NULL,
    Overview TEXT NOT NULL,
    SiteLink VARCHAR(2048) NOT NULL,
    Tags VARCHAR(1000) NOT NULL DEFAULT '',
    PRIMARY KEY (ResourceID)
);

-- Table relating to User stuff
CREATE TABLE IF NOT EXISTS UserProfile (
    UserId BIGINT NOT NULL AUTO_INCREMENT,
    Password VARCHAR(30) NOT NULL,
    FirstName VARCHAR(30) NOT NULL,
    LastName VARCHAR(30) NOT NULL,
    Skills VARCHAR(1000) NOT NULL,
    Interests VARCHAR(1000) NOT NULL,
    Bio VARCHAR(1000) NOT NULL,
    JoinDate DATE NOT NULL,
    PRIMARY KEY (UserId)
);

CREATE TABLE IF NOT EXISTS Followers (
    FollowerLinkId BIGINT NOT NULL AUTO_INCREMENT,
    FollowerUser BIGINT NOT NULL,
    FollowingUser BIGINT NOT NULL,
    PRIMARY KEY (FollowerLinkId),
    CONSTRAINT fk_follower FOREIGN KEY (FollowerUser) REFERENCES UserProfile(Userid),
    CONSTRAINT fk_following FOREIGN KEY (FollowingUser) REFERENCES UserProfile(Userid)
);



-- For the Blogs Page
CREATE TABLE IF NOT EXISTS Blogs (
    BlogId BIGINT NOT NULL AUTO_INCREMENT,
    BlogTitle varchar(100) NOT NULL,
    BlogContent TEXT NOT NULL,
    Tags VARCHAR(1000) NOT NULL,
    Views INT NOT NULL,
    Likes INT NOT NULL,
    Userid BIGINT NOT NULL,
    PRIMARY KEY (BlogId),
    CONSTRAINT fk_User FOREIGN KEY (Userid) REFERENCES UserProfile(Userid)
);

CREATE TABLE IF NOT EXISTS Comments (
    CommentId BIGINT NOT NULL AUTO_INCREMENT,
    CommentContent TEXT NOT NULL,
    Likes INT NOT NULL, 
    UserId BIGINT NOT NULL,
    BlogId BIGINT NOT NULL,
    PRIMARY KEY (CommentId),
    CONSTRAINT fk_BlogsUser FOREIGN KEY (Userid) REFERENCES UserProfile(Userid),
    CONSTRAINT fk_Blogs FOREIGN KEY (BlogId) REFERENCES Blogs(BlogId)
);

CREATE TABLE IF NOT EXISTS CommentThread (
    ThreadCommentId BIGINT NOT NULL AUTO_INCREMENT,
    ParentId BIGINT NOT NULL,
    CommentContent TEXT NOT NULL,
    PRIMARY KEY (ThreadCommentId),
    CONSTRAINT fk_Comment FOREIGN KEY (ParentId) REFERENCES Comments(CommentId)
);


-- for the jobs page
CREATE TABLE IF NOT EXISTS Jobs (
    JobId BIGINT NOT NULL AUTO_INCREMENT,
    JobTitle VARCHAR(50) NOT NULL,
    JobDescription TEXT NOT NULL,
    -- if you want to add tags to the job posts for filtering
    JobTags VARCHAR(1000) NOT NULL,
    -- if you want to implement extrenal job postings
    SiteLink VARCHAR(2048) NOT NULL,
    PRIMARY KEY (JobId)
);

CREATE TABLE IF NOT EXISTS JobApplication (
    ApplicationId BIGINT NOT NULL AUTO_INCREMENT,
    ApplicantResume LONGBLOB NOT NULL,
    UserId BIGINT NOT NULL,
    JobId BIGINT NOT NULL,
    PRIMARY KEY (ApplicationId),
    CONSTRAINT fk_JobsUser FOREIGN KEY (UserId) REFERENCES UserProfile(UserId),
    CONSTRAINT fk_Jobs FOREIGN KEY (JobId) REFERENCES Jobs(JobId)
);


-- Jams tables
CREATE TABLE IF NOT EXISTS Jams (
    JamId BIGINT NOT NULL AUTO_INCREMENT,
    JamTitle VARCHAR(50) NOT NULL,
    JamDescription TEXT NOT NULL,
    JamTags VARCHAR(1000) NOT NULL,
    PRIMARY KEY (JamId)
);

CREATE TABLE IF NOT EXISTS JamEntrants (
    EntryId BIGINT NOT NULL AUTO_INCREMENT,
    UserId BIGINT NOT NULL,
    JamId BIGINT NOT NULL,
    PRIMARY KEY (EntryId),
    CONSTRAINT fk_JamsUser FOREIGN KEY (UserId) REFERENCES UserProfile(UserId),
    CONSTRAINT fk_Jams FOREIGN KEY (JamId) REFERENCES Jams(JamId)
);
