drop database if exists tweets;
create database tweets;

use tweets;

create table tweet_table (
  tweet_id varchar(50) not null,
  created_at varchar(50) not null,
  screen_name varchar(50) not null,
  location varchar(50) not null,
  tweet_text varchar(300) not null,
  latitude float(9, 6) not null,
  longitude float(9, 6) not null,
  id_str varchar(50) not null,
  crop varchar(10) not null,
  keyword_used varchar(50) not null,
  saved_at timestamp DEFAULT CURRENT_TIMESTAMP,
  primary key(tweet_id)
);

ALTER DATABASE
  tweets
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

ALTER TABLE
  tweet_table
  CONVERT TO CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

ALTER TABLE
  tweet_table
  CHANGE tweet_text tweet_text
  VARCHAR(300)
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;