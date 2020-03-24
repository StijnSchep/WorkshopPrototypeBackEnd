/**
 * exports the query's
 */

module.exports = {

    LOGIN_ADMIN:
        `SELECT [Password], ID FROM [Admin] WHERE Email= @AdminEmail`
    ,

    CREATE_ADMIN:
        `INSERT INTO [Admin] (Firstname, Lastname, Password, Email) 
     VALUES (@AdminFirstname, @AdminLastname, @AdminPassword, @AdminEmail);
     SELECT SCOPE_IDENTITY() AS AdminId;`
    ,

    TEACHER_STUDENT_CHECK:
        ` SELECT DISTINCT r.ID, r.ContactCode, r.contactPermissionsId, r.EndDate, r.maxEnrollments, r.minEnrollments, r.OpeningDate, r.RegistreeCode,
     CASE
       WHEN r.ContactCode = @UserCode AND g.OrganisationId = @OrganisationId
       THEN 'CONTACT'
   
       WHEN r.RegistreeCode = @UserCode AND g.OrganisationId = @OrganisationId
       THEN 'REGISTREE'
   
       WHEN r.ContactCode != @UserCode AND RegistreeCode != @UserCode AND g.OrganisationId != @OrganisationId
       THEN 'FALSE'
     END AS Role
     from Registration as r join [Group] as g on r.ID = g.RegistrationId where r.RegistreeCode = @UserCode OR r.ContactCode = @UserCode;`
    ,

    TEACHER_STUDENT_CODE_CHECK:
        `SELECT DISTINCT o.ID, o.Name,
     CASE
       WHEN r.ContactCode = @UserCode
       THEN 'CONTACT'
   
       WHEN  r.RegistreeCode = @UserCode
       THEN 'REGISTREE'
   
       ELSE 'FALSE'
     END AS result
     FROM Registration as r join [Group] as g on r.ID = g.RegistrationId join Organisation as o on g.OrganisationId = o.ID where r.RegistreeCode = @UserCode OR r.ContactCode = @UserCode;`
    ,

    GET_ROLE:
        `SELECT (
        CASE
            WHEN EXISTS(
                    SELECT *
                    FROM Registration
                             JOIN [Group] ON [Group].RegistrationId = Registration.ID
                    WHERE ContactCode = @UserCode
                      AND [Group].OrganisationId = @OrganisationId)
                THEN 'CONTACT'

            WHEN EXISTS(
                    SELECT *
                    FROM Registration
                             JOIN [Group] ON [Group].RegistrationId = Registration.ID
                    WHERE RegistreeCode = @UserCode
                      AND [Group].OrganisationId = @OrganisationId)
                THEN 'REGISTREE'

            WHEN EXISTS(SELECT * FROM Admin WHERE ID = @UserCode AND @OrganisationId = 0) THEN 'ADMIN'

            ELSE 'FALSE'
            END
        ) AS Role;`
    ,

    GET_ALL_WORKSHOPS:
        `SELECT (SELECT Workshop.ID as WorkshopID, Workshop.Name, Workshop.Description, 
            (SELECT WorkshopImage.ImageUrl FROM WorkshopImage WHERE WorkshopId = Workshop.ID FOR JSON PATH) AS WorkshopImages,
            (SELECT WorkshopVideo.VideoUrl FROM WorkshopVideo WHERE WorkshopId = Workshop.ID FOR JSON PATH) AS WorkshopVideos,
            (SELECT AppLinks.Link, AppLinks.Naam FROM AppLinks WHERE WorkshopId = Workshop.ID FOR JSON PATH) AS Applinks
        FROM Workshop FOR JSON PATH) AS result;`
    ,
    ADD_WORKSHOP:
        `INSERT INTO Workshop (Name, Description)
         VALUES (@Name, @Description);
         IF NOT (@Image = 'none')
             INSERT INTO WorkshopImage(ImageUrl, WorkshopId)
            VALUES (@Image, SCOPE_IDENTITY());
         IF NOT (@URL = 'none')
             INSERT INTO WorkshopVideo(VideoUrl, WorkshopId)
            VALUES (@URL, SCOPE_IDENTITY());`
    ,

    UPDATE_WORKSHOP:
        `UPDATE Workshop 
        SET Name = @Name,
        Description = @Description
        WHERE ID = @WorkshopID;
        DELETE FROM WorkshopImage WHERE WorkshopId = 1;
        DELETE FROM WorkshopVideo WHERE WorkshopId =1;
        
        IF NOT (@Image = 'none')
        INSERT INTO WorkshopImage(ImageUrl, WorkshopId)
        VALUES (@Image, @WorkshopID);
        
        IF NOT (@URL = 'none')
        INSERT INTO WorkshopVideo(VideoUrl, WorkshopId)
        VALUES (@URL, @WorkshopID);
        `
    ,

    GET_WORKSHOP_BY_ID:
        `SELECT(SELECT *, 
            (SELECT * FROM WorkshopImage WHERE WorkshopId = @WorkshopID FOR JSON PATH) AS WorkshopImages,
            (SELECT * FROM WorkshopVideo WHERE WorkshopId = @WorkshopID FOR JSON PATH) AS WorkshopVideos,
            (SELECT * FROM AppLinks WHERE WorkshopId = @WorkshopID FOR JSON PATH) AS Applinks
        FROM Workshop WHERE ID = @WorkshopID FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        AS result;`
    ,

    DELETE_WORKSHOP:
        `DELETE FROM WorkshopVideo WHERE WorkshopId = @WorkshopID;
         DELETE FROM WorkshopImage WHERE WorkshopId = @WorkshopID;
        DELETE FROM Workshop WHERE ID = @WorkshopID;`
    ,


    GET_GROUPS_REGISTREE_ROUND_WORKSHOPS_PLACES:
        `SELECT (
        
        SELECT  r.ID AS RoundID,
                r.Name AS RoundName,
                r.StartTime AS RoundStart,
                r.EndTime AS RoundEnd,
                
                (
                    SELECT  rw.ID AS RoundWorkshopID,
                            w.Name AS WorkshopName,
                            w.Description AS WorkshopDescription,
                            wv.VideoUrl AS VideoURL,
               
                            [dbo].CalculatePlacesLeft(rw.ID) AS PlacesLeft
                    FROM Round_Workshop rw JOIN Group_RW grw ON grw.RoundWorkshopId = rw.ID
                                           JOIN Workshop w ON rw.WorkshopId = w.ID
                                           JOIN WorkshopVideo wv ON wv.WorkshopId = w.ID
                    WHERE RoundId = r.ID AND grw.GroupId = gr.ID
                    FOR JSON PATH
                ) AS AvailableWorkshops,
                
                (
                    SELECT  rw.ID AS RoundWorkshopID,
                            w.Name AS WorkshopName,
                            w.Description AS WorkshopDescription,
                            wv.VideoUrl AS VideoURL
                    FROM Enrollment e JOIN Round_Workshop rw ON rw.ID = e.RoundWorkshopId
                                      JOIN Workshop w ON w.ID = rw.WorkshopId
                                      JOIN WorkshopVideo wv ON wv.WorkshopId = w.ID
                               
                    WHERE e.RegistreeId = @RegistreeID AND rw.RoundId = r.ID
                    FOR JSON PATH
                ) AS SelectedWorkshop
        
        FROM [Round] r  JOIN Registration reg ON reg.ID = r.RegistrationId
                        JOIN [Group] gr ON gr.RegistrationId = reg.ID
                        JOIN Registree re ON re.GroupId = gr.ID 
        WHERE re.ID = @RegistreeID FOR JSON PATH
        ) AS result`
    ,


    GET_ROUNDS_WORKSHOP_BY_REGISTATIONID:
        `
    SELECT (SELECT DISTINCT OuterR.ID as rID, OuterR.Name, OuterR.StartTime, OuterR.EndTime, 
             (	SELECT Round_Workshop.ID as RoundWorkshopId, w.Name as WorkshopName, w.ID as WorkshopId, w.description as WorkshopDescription,
                        (SELECT WorkshopImage.ImageUrl FROM WorkshopImage WHERE w.ID = WorkshopImage.WorkshopId FOR JSON PATH) AS WorkshopImages,
                        (SELECT WorkshopVideo.VideoUrl FROM WorkshopVideo WHERE w.ID = WorkshopVideo.WorkshopId FOR JSON PATH) AS WorkshopVideos,
                        (SELECT AppLinks.Link, AppLinks.Naam FROM AppLinks WHERE w.ID = AppLinks.WorkshopId FOR JSON PATH) AS Applinks
                    FROM Workshop w 
                    JOIN [Round_Workshop]	ON Round_Workshop.WorkshopId = w.ID
                    JOIN [Round] r	ON Round_Workshop.RoundId = r.ID
                    WHERE r.RegistrationId = @RegistrationID AND r.ID = OuterR.ID
                    FOR JSON PATH) AS workshops
                FROM [Round] OuterR 
                WHERE RegistrationId = @RegistrationID FOR JSON PATH) as result`
    ,


    ADD_ENROLLMENT:
        `
        INSERT INTO Enrollment(RegistreeId, RoundWorkshopId)
        VALUES (@RegistreeID, @RoundWorkshopID);
        SELECT SCOPE_IDENTITY() AS EnrollmentId;`
    ,


    GET_ALL_ENROLLMENTS:
        `SELECT * FROM [Enrollment];`
    ,


    DELETE_ENROLLMENT_BY_REGISTEEID:
        `DELETE FROM Enrollment WHERE RegistreeId = @RegistreeID;`
    ,


    GET_ENROLLMENTS_BY_ROUND_WORKSHOP_ID:
        `SELECT * FROM Enrollment WHERE RoundWorkshopId = @RoundWorkshopID`
    ,


    GET_NOT_ENROLLED:
        `		SELECT r.*, g.[Name] FROM Registree AS r JOIN [Group] AS g ON r.GroupId = g.ID WHERE r.ID NOT IN (
                SELECT RegistreeId FROM Enrollment
                JOIN Registree ON Registree.ID = Enrollment.RegistreeId
                JOIN [Group] ON [Group].ID = Registree.GroupId
                JOIN Registration ON Registration.ID = [Group].RegistrationId
                WHERE RegistrationId = @RegistrationID
                ) `
    ,


    ADD_GROUP:
        `INSERT INTO [Group](Name, OrganisationId, RegistrationId)
        VALUES(@Name, @OrganisationID, @RegistrationId);
        SELECT SCOPE_IDENTITY() AS GroupId;`
    ,


    GET_ALL_ORGANISATIONS:
        `SELECT * FROM Organisation;`
    ,


    ADD_ORGANISATION:
        `INSERT INTO Organisation(Name, Logo) 
        VALUES (@Name, @Logo);
        SELECT SCOPE_IDENTITY() AS OrganisationId;`
    ,


    UPDATE_ORGANISATION:
        `UPDATE Organisation 
        SET Name = @Name,
        Logo = @Logo
        WHERE ID = @OrganisationID
        SELECT * FROM Organisation WHERE ID = @OrganisationID;`
    ,


    DELETE_ORGANISATION:
        `DELETE FROM Organisation WHERE ID = @OrganisationID;`
    ,


    GET_ORGANISATION_BY_ID:
        `SELECT * FROM Organisation WHERE ID = @OrganisationID;`
    ,


    GET_GROUPS_REGISTREES_BY_ORGANISATION:
        `SELECT (SELECT gr.ID as GroupId, gr.Name AS GroupName, gr.RegistrationId AS RegistrationId, 
        (SELECT Registree.Id AS RegistreeId, Registree.Firstname, Registree.Lastname, Registree.Email, Registree.GroupId FROM Registree WHERE Registree.GroupId = gr.ID  FOR JSON PATH) AS Registrees
         FROM [Group] gr
         WHERE OrganisationId = @OrganisationID  AND RegistrationId = @RegistrationID
         FOR JSON PATH) AS result`
    ,


    GET_ALL_REGISTRATIONS:
        `SELECT DISTINCT r.*, o.Name FROM Registration AS r JOIN [Group] AS g ON g.RegistrationId = r.ID JOIN Organisation AS o ON o.ID = g.OrganisationId;`
    ,


    ADD_REGISTRATION:
        `INSERT INTO Registration(OpeningDate, EndDate, WorkshopDate, ContactCode, RegistreeCode, minEnrollments, maxEnrollments, contactPermissionsId, location, startTime, endTime)
        VALUES (@OpeningDate, 
        @EndDate, 
        @WorkshopDate, 
        @ContactCode, 
        @RegistreeCode, 
        @MinEnrollments,
        @MaxEnrollments,
        @ContactPermissionsId,
        @Location,
        @StartTime,
        @EndTime);
        SELECT SCOPE_IDENTITY() AS ReservationId;`
    ,


    DELETE_REGISTRATION:
        `DELETE FROM Registration WHERE ID = @RegistrationID;`
    ,


    GET_REGISTRATION_BY_ID:
        `SELECT * FROM Registration WHERE ID = @RegistrationID;`
    ,


    ADD_ROUND_WORKSHOP_GROUP:
        `INSERT INTO Group_RW(RoundWorkshopId, GroupId) VALUES (@RoundWorkshopID, @GroupID);`
    ,


    ADD_ROUND_WORKSHOP:
        `INSERT INTO Round_Workshop(RoundId, WorkshopId, MaxParticipants) VALUES (@RoundID, @WorkshopID, @MaxParticipants); `
    ,


    ADD_REGISTREE:
        `INSERT INTO Registree(Firstname, Lastname, GroupId)
        VALUES (@Firstname, @Lastname, @GroupId);
        SELECT SCOPE_IDENTITY() AS OrganisationId;`
    ,


    UPDATE_REGISTREE:
        `
    UPDATE Registree
    SET Firstname = @Firstname, 
    Lastname = @Lastname, 
    Email = @Email, 
    GroupId = @GroupId
    WHERE ID = @Id
    `,

    ADD_ROUND:
        `INSERT INTO Round(Name, StartTime, EndTime, RegistrationId)
    VALUES (@Name, @StartTime, @EndTime, @RegistrationID);
    SELECT SCOPE_IDENTITY() AS RoundId;`,


    DELETE_ROUND:
        `DELETE FROM [Round] WHERE ID = @RoundID`
    ,

    ADD_FILE:
        `INSERT INTO Files(filePath)
        VALUES (@Path);
        SELECT SCOPE_IDENTITY() AS ID;`,
    GET_FILE:
        `SELECT * FROM Files WHERE ID = @FileID
        `,

    //BEWAREN
    ADD_ROUND_WORKSHOP:
        `
            INSERT INTO Round_Workshop (RoundId, WorkshopId, MaxParticipants) VALUES
            (@RoundId, @WorkshopId, @MaxParticipants)
            SELECT SCOPE_IDENTITY() AS RoundWorkshopId
            `,

    // BEWAREN
    ADD_ROUND_WORKSHOP_GROUP:
        `
            INSERT INTO Group_RW (RoundWorkshopId, GroupId) VALUES 
            (@RoundWorkshopId, @GroupId)
            `
}
