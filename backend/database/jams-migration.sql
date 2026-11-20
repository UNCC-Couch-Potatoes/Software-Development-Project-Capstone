ALTER TABLE Jams ADD COLUMN OwnerUserId BIGINT NULL;

ALTER TABLE Jams
    ADD COLUMN CoverImageUrl VARCHAR(2048) NULL,
    ADD COLUMN StartTime DATETIME NULL,
    ADD COLUMN EndTime DATETIME NULL;

ALTER TABLE Jams ADD COLUMN JamDetailedDescription TEXT NULL AFTER JamDescription;

ALTER TABLE JamEntrants ADD UNIQUE KEY UQ_JamEntrant (UserId, JamId);

UPDATE Jams SET StartTime = UTC_TIMESTAMP() - INTERVAL 1 DAY, EndTime = UTC_TIMESTAMP() + INTERVAL 2 DAY
WHERE JamTitle = 'Autumn Pixel Jam' AND StartTime IS NULL;

UPDATE Jams SET StartTime = UTC_TIMESTAMP() + INTERVAL 5 DAY, EndTime = UTC_TIMESTAMP() + INTERVAL 7 DAY
WHERE JamTitle = 'Solo Godot Weekend' AND StartTime IS NULL;

UPDATE Jams SET JamDetailedDescription = '## About this jam

A 72-hour jam focused on pixel art games. Teams of up to 4, any engine welcome.

## Rules

- Keep your art style pixel-based
- Teams of 1 to 4 people
- Submit your game page before the jam ends'
WHERE JamTitle = 'Autumn Pixel Jam' AND JamDetailedDescription IS NULL;

UPDATE Jams SET JamDetailedDescription = '## About this jam

Make a small game solo in one weekend using Godot. The theme is revealed at the start.

## Rules

- Solo entries only
- Godot only
- No pre-made assets from before the jam starts'
WHERE JamTitle = 'Solo Godot Weekend' AND JamDetailedDescription IS NULL;