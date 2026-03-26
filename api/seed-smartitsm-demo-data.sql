SET NOCOUNT ON;
SET XACT_ABORT ON;

-- Preflight guard: this script expects the SmartITSM schema to already exist.
IF OBJECT_ID('dbo.Notifications', 'U') IS NULL
BEGIN
    RAISERROR(
        'Table dbo.Notifications not found. You are likely on the wrong database or EF migrations were not applied. Run dotnet ef database update for SmartITSM first, then rerun this script.',
        16,
        1
    );
    RETURN;
END;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @PasswordHash NVARCHAR(MAX) = 'AQAAAAIAAYagAAAAEOKQQCaroEwbX86jxg0yt4+jHeMXZBg4jzAbl8FsvPrDcuS52J/iTAj6ztZ6DHGlYg==';

    -- Independent security stamps for each user row.
    DECLARE @Stamp1 NVARCHAR(MAX) = CONVERT(NVARCHAR(36), NEWID());
    DECLARE @Stamp2 NVARCHAR(MAX) = CONVERT(NVARCHAR(36), NEWID());
    DECLARE @Stamp3 NVARCHAR(MAX) = CONVERT(NVARCHAR(36), NEWID());
    DECLARE @Stamp4 NVARCHAR(MAX) = CONVERT(NVARCHAR(36), NEWID());
    DECLARE @Stamp5 NVARCHAR(MAX) = CONVERT(NVARCHAR(36), NEWID());
    DECLARE @Stamp6 NVARCHAR(MAX) = CONVERT(NVARCHAR(36), NEWID());
    DECLARE @Stamp7 NVARCHAR(MAX) = CONVERT(NVARCHAR(36), NEWID());
    DECLARE @Stamp8 NVARCHAR(MAX) = CONVERT(NVARCHAR(36), NEWID());
    DECLARE @Stamp9 NVARCHAR(MAX) = CONVERT(NVARCHAR(36), NEWID());
    DECLARE @Stamp10 NVARCHAR(MAX) = CONVERT(NVARCHAR(36), NEWID());

    -- Purge dependent data first to avoid FK violations.
    DELETE FROM Notifications;
    DELETE FROM ApprovalRequests;
    DELETE FROM TicketComments;
    DELETE FROM AuditLogs;
    DELETE FROM Tickets;
    DELETE FROM Assets;
    DELETE FROM AspNetUserRoles;
    DELETE FROM AspNetUserClaims;
    DELETE FROM AspNetRoleClaims;
    DELETE FROM AspNetUserLogins;
    DELETE FROM AspNetUserTokens;
    DELETE FROM Users;
    DELETE FROM Roles;
    DELETE FROM Departments;
    DELETE FROM Categories;
    DELETE FROM TicketStatuses;
    DELETE FROM SlaPolicies;
    DELETE FROM AssetTypes;

    DBCC CHECKIDENT ('Notifications', RESEED, 0);
    DBCC CHECKIDENT ('ApprovalRequests', RESEED, 0);
    DBCC CHECKIDENT ('TicketComments', RESEED, 0);
    DBCC CHECKIDENT ('AuditLogs', RESEED, 0);
    DBCC CHECKIDENT ('Tickets', RESEED, 0);
    DBCC CHECKIDENT ('Assets', RESEED, 0);
    DBCC CHECKIDENT ('Users', RESEED, 0);
    DBCC CHECKIDENT ('Roles', RESEED, 0);
    DBCC CHECKIDENT ('Departments', RESEED, 0);
    DBCC CHECKIDENT ('Categories', RESEED, 0);
    DBCC CHECKIDENT ('TicketStatuses', RESEED, 0);
    DBCC CHECKIDENT ('SlaPolicies', RESEED, 0);
    DBCC CHECKIDENT ('AssetTypes', RESEED, 0);

    SET IDENTITY_INSERT TicketStatuses ON;
    INSERT INTO TicketStatuses (Id, Name)
    VALUES
        (1, 'Open'),
        (2, 'Pending'),
        (3, 'In Progress'),
        (4, 'Resolved'),
        (5, 'Closed'),
        (6, 'Pending Approval');
    SET IDENTITY_INSERT TicketStatuses OFF;

    SET IDENTITY_INSERT Categories ON;
    INSERT INTO Categories (Id, Name, DefaultPriority, RequiresApproval)
    VALUES
        (1, 'Hardware Request', 'Medium', 1),
        (2, 'Hardware Issue', 'High', 0),
        (3, 'Software & Apps', 'Medium', 0),
        (4, 'Network & Connectivity', 'High', 0),
        (5, 'Access & Permissions', 'Medium', 1),
        (6, 'Security Incident', 'Critical', 0);
    SET IDENTITY_INSERT Categories OFF;

    SET IDENTITY_INSERT SlaPolicies ON;
    INSERT INTO SlaPolicies (Id, PriorityLevel, MaxResponseHours, MaxResolveHours)
    VALUES
        (1, 0, 24, 72),
        (2, 1, 8, 48),
        (3, 2, 2, 12),
        (4, 3, 0, 4);
    SET IDENTITY_INSERT SlaPolicies OFF;

    SET IDENTITY_INSERT AssetTypes ON;
    INSERT INTO AssetTypes (Id, Name)
    VALUES
        (1, 'Laptop'),
        (2, 'Workstation'),
        (3, 'Monitor'),
        (4, 'Network Equipment'),
        (5, 'Peripherals');
    SET IDENTITY_INSERT AssetTypes OFF;

    SET IDENTITY_INSERT Departments ON;
    INSERT INTO Departments (Id, Name, LocationCode)
    VALUES
        (1, 'IT Infrastructure', 'HPG-TWR-FL5'),
        (2, 'Human Resources', 'HPG-TWR-FL2'),
        (3, 'Finance & Accounting', 'HPG-TWR-FL2'),
        (4, 'Sales & Marketing', 'HPG-TWR-FL3'),
        (5, 'Logistics Operations', 'HPG-WH-01');
    SET IDENTITY_INSERT Departments OFF;

    SET IDENTITY_INSERT Roles ON;
    INSERT INTO Roles (Id, Name, NormalizedName, ConcurrencyStamp)
    VALUES
        (1, 'Admin', 'ADMIN', NULL),
        (2, 'Technician', 'TECHNICIAN', NULL),
        (3, 'Requester', 'REQUESTER', NULL);
    SET IDENTITY_INSERT Roles OFF;

    SET IDENTITY_INSERT Users ON;
    INSERT INTO Users
    (
        Id,
        UserName,
        NormalizedUserName,
        Email,
        NormalizedEmail,
        EmailConfirmed,
        PasswordHash,
        SecurityStamp,
        ConcurrencyStamp,
        PhoneNumber,
        PhoneNumberConfirmed,
        TwoFactorEnabled,
        LockoutEnabled,
        AccessFailedCount,
        FullName,
        IsActive,
        DepartmentId
    )
    VALUES
        (1, 'sysadmin@smartitsm.vn', 'SYSADMIN@SMARTITSM.VN', 'sysadmin@smartitsm.vn', 'SYSADMIN@SMARTITSM.VN', 1, @PasswordHash, @Stamp1, CONVERT(NVARCHAR(36), NEWID()), '+84901234567', 1, 1, 1, 0, 'System Administrator', 1, 1),
        (2, 'it.director@smartitsm.vn', 'IT.DIRECTOR@SMARTITSM.VN', 'it.director@smartitsm.vn', 'IT.DIRECTOR@SMARTITSM.VN', 1, @PasswordHash, @Stamp2, CONVERT(NVARCHAR(36), NEWID()), NULL, 0, 0, 1, 0, 'Nguyen Van Director', 1, 1),
        (3, 'hai.tran@smartitsm.vn', 'HAI.TRAN@SMARTITSM.VN', 'hai.tran@smartitsm.vn', 'HAI.TRAN@SMARTITSM.VN', 1, @PasswordHash, @Stamp3, CONVERT(NVARCHAR(36), NEWID()), NULL, 0, 0, 1, 0, 'Tran Van Hai', 1, 1),
        (4, 'mai.le@smartitsm.vn', 'MAI.LE@SMARTITSM.VN', 'mai.le@smartitsm.vn', 'MAI.LE@SMARTITSM.VN', 1, @PasswordHash, @Stamp4, CONVERT(NVARCHAR(36), NEWID()), NULL, 0, 0, 1, 0, 'Le Thi Mai', 1, 1),
        (5, 'long.pham@smartitsm.vn', 'LONG.PHAM@SMARTITSM.VN', 'long.pham@smartitsm.vn', 'LONG.PHAM@SMARTITSM.VN', 1, @PasswordHash, @Stamp5, CONVERT(NVARCHAR(36), NEWID()), NULL, 0, 0, 1, 0, 'Pham Bao Long', 1, 1),
        (6, 'anh.duc@smartitsm.vn', 'ANH.DUC@SMARTITSM.VN', 'anh.duc@smartitsm.vn', 'ANH.DUC@SMARTITSM.VN', 1, @PasswordHash, @Stamp6, CONVERT(NVARCHAR(36), NEWID()), NULL, 0, 0, 1, 0, 'Nguyen Duc Anh', 1, 2),
        (7, 'yen.vu@smartitsm.vn', 'YEN.VU@SMARTITSM.VN', 'yen.vu@smartitsm.vn', 'YEN.VU@SMARTITSM.VN', 1, @PasswordHash, @Stamp7, CONVERT(NVARCHAR(36), NEWID()), NULL, 0, 0, 1, 0, 'Vu Hoang Yen', 1, 3),
        (8, 'tri.doan@smartitsm.vn', 'TRI.DOAN@SMARTITSM.VN', 'tri.doan@smartitsm.vn', 'TRI.DOAN@SMARTITSM.VN', 1, @PasswordHash, @Stamp8, CONVERT(NVARCHAR(36), NEWID()), NULL, 0, 0, 1, 0, 'Doan Minh Tri', 1, 4),
        (9, 'ngoc.bui@smartitsm.vn', 'NGOC.BUI@SMARTITSM.VN', 'ngoc.bui@smartitsm.vn', 'NGOC.BUI@SMARTITSM.VN', 1, @PasswordHash, @Stamp9, CONVERT(NVARCHAR(36), NEWID()), NULL, 0, 0, 1, 0, 'Bui Bich Ngoc', 1, 4),
        (10, 'kiet.hoang@smartitsm.vn', 'KIET.HOANG@SMARTITSM.VN', 'kiet.hoang@smartitsm.vn', 'KIET.HOANG@SMARTITSM.VN', 1, @PasswordHash, @Stamp10, CONVERT(NVARCHAR(36), NEWID()), NULL, 0, 0, 1, 0, 'Hoang Tuan Kiet', 1, 5);
    SET IDENTITY_INSERT Users OFF;

    INSERT INTO AspNetUserRoles (UserId, RoleId)
    VALUES
        (1, 1), (2, 1),
        (3, 2), (4, 2), (5, 2),
        (6, 3), (7, 3), (8, 3), (9, 3), (10, 3);

    SET IDENTITY_INSERT Assets ON;
    INSERT INTO Assets (Id, AssetTag, Name, SerialNum, Status, TypeId, AssignedUserId)
    VALUES
        (1, 'LPT-HPG-015', 'Lenovo ThinkPad T14 Gen 3', 'PF3L9Z8A', 'InUse', 1, 7),
        (2, 'LPT-HPG-016', 'MacBook Pro 16 M2', 'C02XD45G1', 'InUse', 1, 8),
        (3, 'LPT-HPG-088', 'Dell Latitude 7420', 'DL-742-99X', 'Broken', 1, NULL),
        (4, 'MNT-HPG-102', 'Dell UltraSharp 27" 4K', 'CN-0XG112', 'InStock', 3, NULL),
        (5, 'NET-HPG-001', 'Cisco Meraki MR46 Access Point', 'Q2KD-5XXX', 'InUse', 4, NULL),
        (6, 'PRP-HPG-055', 'Logitech MX Master 3S', 'LZ9922X', 'InUse', 5, 10);
    SET IDENTITY_INSERT Assets OFF;

    -- 30-ticket dataset spanning ~60 days for dashboard trend lines.
    SET IDENTITY_INSERT Tickets ON;
    INSERT INTO Tickets
    (
        Id,
        Title,
        Description,
        Priority,
        StatusId,
        CategoryId,
        CreatedAt,
        ResolvedAt,
        DueDate,
        RequesterId,
        AssignedTechId,
        RelatedAssetId
    )
    VALUES
        (1, 'Screen flickering when opening Excel files', 'External monitor flickers for two seconds when opening heavy workbooks.', 1, 3, 2, DATEADD(day, -29, GETUTCDATE()), NULL, DATEADD(day, 2, GETUTCDATE()), 7, 4, 1),
        (2, 'Cannot access the Haiphong Warehouse ERP module', 'Getting Access Denied (403) while approving manifests in ERP.', 2, 1, 5, DATEADD(day, -1, GETUTCDATE()), NULL, DATEADD(day, 1, GETUTCDATE()), 10, NULL, NULL),
        (3, 'Requesting Adobe Illustrator License', 'Need Illustrator license for Q3 marketing campaign banners.', 0, 6, 3, DATEADD(day, -8, GETUTCDATE()), NULL, DATEADD(day, 6, GETUTCDATE()), 9, NULL, NULL),
        (4, 'Urgent suspicious finance phishing email', 'Received spoofed CEO wire-transfer request from unknown sender domain.', 3, 5, 6, DATEADD(day, -46, GETUTCDATE()), DATEADD(day, -45, GETUTCDATE()), DATEADD(day, -45, GETUTCDATE()), 6, 5, NULL),
        (5, 'Laptop battery dies after 30 minutes', 'Battery drains rapidly; request replacement device.', 1, 4, 2, DATEADD(day, -18, GETUTCDATE()), DATEADD(day, -11, GETUTCDATE()), DATEADD(day, -13, GETUTCDATE()), 8, 3, 3),
        (6, 'VPN drops every 20 minutes', 'Connection to HQ VPN disconnects repeatedly during meetings.', 2, 3, 4, DATEADD(day, -15, GETUTCDATE()), NULL, DATEADD(day, -14, GETUTCDATE()), 7, 3, 5),
        (7, 'Outlook crashes on startup', 'Outlook closes immediately after splash screen.', 1, 4, 3, DATEADD(day, -35, GETUTCDATE()), DATEADD(day, -31, GETUTCDATE()), DATEADD(day, -32, GETUTCDATE()), 6, 4, NULL),
        (8, 'Cannot print payslips on HR floor', 'Network printer queue hangs and jobs stay pending.', 1, 2, 4, DATEADD(day, -12, GETUTCDATE()), NULL, DATEADD(day, 1, GETUTCDATE()), 7, 5, NULL),
        (9, 'Request for dual monitor setup', 'Need two monitors for campaign analytics and ad ops.', 0, 6, 1, DATEADD(day, -6, GETUTCDATE()), NULL, DATEADD(day, 4, GETUTCDATE()), 9, NULL, 4),
        (10, 'Intermittent Wi-Fi in FL3 west wing', 'Wi-Fi packet loss impacts calls and uploads.', 2, 3, 4, DATEADD(day, -21, GETUTCDATE()), NULL, DATEADD(day, 1, GETUTCDATE()), 9, 3, 5),
        (11, 'SAP add-in missing in Excel', 'Finance add-in disappeared after Office update.', 1, 4, 3, DATEADD(day, -40, GETUTCDATE()), DATEADD(day, -37, GETUTCDATE()), DATEADD(day, -38, GETUTCDATE()), 10, 4, 1),
        (12, 'Keyboard key repeats unexpectedly', 'Enter key repeats causing accidental submits.', 0, 5, 2, DATEADD(day, -52, GETUTCDATE()), DATEADD(day, -50, GETUTCDATE()), DATEADD(day, -50, GETUTCDATE()), 8, 5, 6),
        (13, 'Need access to procurement folder', 'Please grant read/write for monthly procurement folder.', 1, 1, 5, DATEADD(day, -2, GETUTCDATE()), NULL, DATEADD(day, 2, GETUTCDATE()), 10, NULL, NULL),
        (14, 'Security patch rollback request', 'Legacy app breaks after endpoint hardening update.', 2, 2, 6, DATEADD(day, -4, GETUTCDATE()), NULL, DATEADD(day, 1, GETUTCDATE()), 8, 5, 2),
        (15, 'Laptop fan always at max speed', 'Device overheats and fan noise is constant.', 1, 3, 2, DATEADD(day, -10, GETUTCDATE()), NULL, DATEADD(day, 2, GETUTCDATE()), 6, 4, 1),
        (16, 'Google Drive sync stuck', 'Sync client stuck on indexing for two days.', 1, 1, 3, DATEADD(day, -7, GETUTCDATE()), NULL, DATEADD(day, 2, GETUTCDATE()), 7, NULL, NULL),
        (17, 'Warehouse scanner cannot connect', 'Barcode scanner loses network every few scans.', 2, 3, 4, DATEADD(day, -13, GETUTCDATE()), NULL, DATEADD(day, 2, GETUTCDATE()), 10, 3, 5),
        (18, 'Cannot unlock BitLocker after BIOS update', 'Recovery key prompt appears each restart.', 2, 4, 6, DATEADD(day, -28, GETUTCDATE()), DATEADD(day, -24, GETUTCDATE()), DATEADD(day, -25, GETUTCDATE()), 8, 5, 3),
        (19, 'Request Canva Pro team seat', 'Need a temporary Canva seat for product launch assets.', 0, 6, 3, DATEADD(day, -3, GETUTCDATE()), NULL, DATEADD(day, 5, GETUTCDATE()), 9, NULL, NULL),
        (20, 'Teams camera not detected', 'Camera missing in Teams but works in Windows app.', 1, 2, 2, DATEADD(day, -11, GETUTCDATE()), NULL, DATEADD(day, 1, GETUTCDATE()), 7, 4, 2),
        (21, 'Critical DB alert flood in monitoring', 'Pager alerts from DB monitor every 3 minutes; service degradation visible.', 3, 3, 4, DATEADD(day, -3, GETUTCDATE()), NULL, DATEADD(day, -2, GETUTCDATE()), 6, 3, 5),
        (22, 'Payroll export job failed', 'Payroll export fails with timeout and no output file.', 2, 1, 3, DATEADD(day, -5, GETUTCDATE()), NULL, DATEADD(day, 1, GETUTCDATE()), 7, NULL, 1),
        (23, 'Monitor has dead pixels', 'Three bright dead pixels in center area.', 0, 4, 2, DATEADD(day, -33, GETUTCDATE()), DATEADD(day, -30, GETUTCDATE()), DATEADD(day, -31, GETUTCDATE()), 9, 5, 4),
        (24, 'Password reset self-service not sending email', 'Reset email never received by multiple users.', 2, 3, 5, DATEADD(day, -9, GETUTCDATE()), NULL, DATEADD(day, 1, GETUTCDATE()), 10, 4, NULL),
        (25, 'Remote desktop latency from warehouse', 'RDP lag spikes up to 2 seconds every minute.', 1, 3, 4, DATEADD(day, -23, GETUTCDATE()), NULL, DATEADD(day, 2, GETUTCDATE()), 6, 3, 2),
        (26, 'USB ports disabled after hardening', 'Cannot use authorized USB security token.', 2, 2, 6, DATEADD(day, -14, GETUTCDATE()), NULL, DATEADD(day, 2, GETUTCDATE()), 8, 5, 3),
        (27, 'Need Visio license renewal', 'License expired during network diagram update.', 1, 6, 3, DATEADD(day, -16, GETUTCDATE()), NULL, DATEADD(day, 4, GETUTCDATE()), 9, NULL, NULL),
        (28, 'Docking station not charging laptop', 'Power cycles when laptop battery below 20 percent.', 1, 1, 2, DATEADD(day, -19, GETUTCDATE()), NULL, DATEADD(day, 2, GETUTCDATE()), 7, NULL, 1),
        (29, 'Critical: Public website SSL certificate expired', 'Customer portal certificate expired and browser blocks access.', 3, 1, 6, DATEADD(day, -6, GETUTCDATE()), NULL, DATEADD(day, -5, GETUTCDATE()), 6, NULL, NULL),
        (30, 'Need temporary intern account permissions', 'Grant intern access to shared sales report folder.', 0, 5, 5, DATEADD(day, -41, GETUTCDATE()), DATEADD(day, -39, GETUTCDATE()), DATEADD(day, -40, GETUTCDATE()), 9, 4, NULL);
    SET IDENTITY_INSERT Tickets OFF;

    -- Approval workflow coverage: one pending + one rejected.
    SET IDENTITY_INSERT ApprovalRequests ON;
    INSERT INTO ApprovalRequests (Id, TicketId, ApproverId, Status, Reason, CreatedAt, ResolvedAt)
    VALUES
        (1, 3, 2, 0, NULL, DATEADD(day, -8, GETUTCDATE()), NULL),
        (2, 9, 2, 2, 'Rejected due to budget freeze for non-essential peripherals this month.', DATEADD(day, -6, GETUTCDATE()), DATEADD(day, -5, GETUTCDATE()));
    SET IDENTITY_INSERT ApprovalRequests OFF;

    -- 15 comments with one mega-thread on Ticket #1 to demo real-time collaboration UX.
    SET IDENTITY_INSERT TicketComments ON;
    INSERT INTO TicketComments (Id, TicketId, UserId, Content, CreatedAt)
    VALUES
        (1, 1, 4, 'I can start with remote diagnostics. Please share when the flickering happens most often.', DATEADD(day, -29, DATEADD(minute, 45, GETUTCDATE()))),
        (2, 1, 7, 'It mostly starts when I open large Excel files and plug into the dock.', DATEADD(day, -29, DATEADD(hour, 1, GETUTCDATE()))),
        (3, 1, 4, 'Understood. I have pushed Intel GPU driver 31.x to your machine.', DATEADD(day, -29, DATEADD(hour, 2, GETUTCDATE()))),
        (4, 1, 7, 'Driver installed. Flicker reduced but still appears after standby.', DATEADD(day, -28, DATEADD(hour, 3, GETUTCDATE()))),
        (5, 1, 4, 'Please disable panel self-refresh in Intel Graphics Command Center.', DATEADD(day, -28, DATEADD(hour, 4, GETUTCDATE()))),
        (6, 1, 7, 'Done. That helped, but one black flash still happened.', DATEADD(day, -27, DATEADD(hour, 2, GETUTCDATE()))),
        (7, 1, 4, 'I will replace your HDMI cable and dock firmware this afternoon.', DATEADD(day, -27, DATEADD(hour, 6, GETUTCDATE()))),
        (8, 1, 7, 'After cable swap and firmware update, issue has not returned. Thanks!', DATEADD(day, -26, DATEADD(hour, 5, GETUTCDATE()))),
        (9, 6, 3, 'VPN logs show packet loss from ISP route. Applying alternate profile now.', DATEADD(day, -15, DATEADD(hour, 2, GETUTCDATE()))),
        (10, 8, 7, 'Printer queue still blocked after restart; attaching screenshot in Teams.', DATEADD(day, -11, DATEADD(hour, 3, GETUTCDATE()))),
        (11, 14, 5, 'Security hardening policy exception requested for this legacy app.', DATEADD(day, -4, DATEADD(hour, 1, GETUTCDATE()))),
        (12, 21, 3, 'Escalated to NOC. Collecting metrics from AP and switch interfaces.', DATEADD(day, -3, DATEADD(hour, 1, GETUTCDATE()))),
        (13, 24, 4, 'SMTP relay quota was exceeded; quota increased and monitoring enabled.', DATEADD(day, -8, DATEADD(hour, 4, GETUTCDATE()))),
        (14, 25, 6, 'RDP latency tied to scheduled backup window. Testing at off-peak now.', DATEADD(day, -22, DATEADD(hour, 2, GETUTCDATE()))),
        (15, 29, 5, 'Renewal request sent to certificate authority. Awaiting validation email.', DATEADD(day, -6, DATEADD(hour, 3, GETUTCDATE())));
    SET IDENTITY_INSERT TicketComments OFF;

    -- 15 notifications with mixed seen/read states for bell counters and history.
    SET IDENTITY_INSERT Notifications ON;
    INSERT INTO Notifications (Id, UserId, Message, IsRead, IsSeen, RelatedTicketId, CreatedAt)
    VALUES
        (1, 2, 'Approval needed for Adobe Illustrator license request.', 0, 0, 3, DATEADD(day, -8, GETUTCDATE())),
        (2, 7, 'Mai Le commented on your monitor flicker ticket.', 0, 0, 1, DATEADD(day, -27, GETUTCDATE())),
        (3, 8, 'Your laptop battery replacement ticket is resolved.', 1, 1, 5, DATEADD(day, -11, GETUTCDATE())),
        (4, 9, 'Your dual monitor approval request was rejected.', 1, 1, 9, DATEADD(day, -5, GETUTCDATE())),
        (5, 6, 'Critical SSL certificate incident has breached SLA.', 0, 0, 29, DATEADD(day, -5, DATEADD(hour, 6, GETUTCDATE()))),
        (6, 10, 'Access request ticket updated to In Progress.', 1, 1, 24, DATEADD(day, -8, GETUTCDATE())),
        (7, 6, 'DB alert flood ticket assigned to Tran Van Hai.', 1, 1, 21, DATEADD(day, -3, GETUTCDATE())),
        (8, 7, 'VPN drops ticket is overdue. Technician is still investigating.', 0, 0, 6, DATEADD(day, -14, GETUTCDATE())),
        (9, 8, 'Pending action: provide additional details for camera issue.', 1, 0, 20, DATEADD(day, -9, GETUTCDATE())),
        (10, 9, 'New comment on your licensing ticket.', 1, 1, 19, DATEADD(day, -2, GETUTCDATE())),
        (11, 2, 'Approval request rejected for ticket #9.', 1, 1, 9, DATEADD(day, -5, GETUTCDATE())),
        (12, 10, 'Intern permissions ticket has been closed.', 1, 1, 30, DATEADD(day, -39, GETUTCDATE())),
        (13, 7, 'Your printer issue moved to Pending status.', 0, 0, 8, DATEADD(day, -10, GETUTCDATE())),
        (14, 6, 'Security rollback request is waiting for your update.', 1, 1, 14, DATEADD(day, -3, GETUTCDATE())),
        (15, 1, 'Daily SLA digest: 3 tickets currently overdue.', 1, 1, NULL, DATEADD(hour, -8, GETUTCDATE()));
    SET IDENTITY_INSERT Notifications OFF;

    -- Audit history: 50+ logs for timelines and report drill-downs.
    -- Base log on every ticket.
    INSERT INTO AuditLogs (TicketId, Action, UserId, Timestamp)
    SELECT
        t.Id,
        'Ticket created by requester',
        t.RequesterId,
        DATEADD(minute, 1, t.CreatedAt)
    FROM Tickets t;

    -- Assignment logs where a technician exists.
    INSERT INTO AuditLogs (TicketId, Action, UserId, Timestamp)
    SELECT
        t.Id,
        CONCAT('Ticket assigned to technician #', t.AssignedTechId),
        1,
        DATEADD(minute, 10, t.CreatedAt)
    FROM Tickets t
    WHERE t.AssignedTechId IS NOT NULL;

    -- Rich progression logs for 5 demo tickets.
    INSERT INTO AuditLogs (TicketId, Action, UserId, Timestamp)
    VALUES
        (1, 'Priority confirmed as Medium', 4, DATEADD(day, -29, DATEADD(minute, 90, GETUTCDATE()))),
        (1, 'Status changed to In Progress', 4, DATEADD(day, -29, DATEADD(hour, 3, GETUTCDATE()))),
        (1, 'Remote troubleshooting started', 4, DATEADD(day, -28, DATEADD(hour, 2, GETUTCDATE()))),
        (1, 'Hardware dock firmware updated', 4, DATEADD(day, -27, DATEADD(hour, 5, GETUTCDATE()))),
        (1, 'Awaiting requester confirmation', 4, DATEADD(day, -26, DATEADD(hour, 2, GETUTCDATE()))),

        (5, 'Status changed to In Progress', 3, DATEADD(day, -18, DATEADD(hour, 4, GETUTCDATE()))),
        (5, 'Battery diagnostics completed', 3, DATEADD(day, -17, DATEADD(hour, 2, GETUTCDATE()))),
        (5, 'Approved hardware swap request', 2, DATEADD(day, -16, DATEADD(hour, 1, GETUTCDATE()))),
        (5, 'Replacement device prepared', 3, DATEADD(day, -12, DATEADD(hour, 3, GETUTCDATE()))),
        (5, 'Status changed to Resolved', 3, DATEADD(day, -11, DATEADD(hour, 2, GETUTCDATE()))),

        (6, 'Status changed to In Progress', 3, DATEADD(day, -15, DATEADD(hour, 1, GETUTCDATE()))),
        (6, 'Network route diagnostics started', 3, DATEADD(day, -15, DATEADD(hour, 2, GETUTCDATE()))),
        (6, 'Escalated due to SLA breach risk', 3, DATEADD(day, -14, DATEADD(hour, 4, GETUTCDATE()))),
        (6, 'Requester asked to test alternate VPN profile', 3, DATEADD(day, -13, DATEADD(hour, 3, GETUTCDATE()))),
        (6, 'Awaiting requester feedback', 3, DATEADD(day, -12, DATEADD(hour, 2, GETUTCDATE()))),

        (21, 'Critical incident triage started', 3, DATEADD(day, -3, DATEADD(hour, 1, GETUTCDATE()))),
        (21, 'Priority validated as Critical', 1, DATEADD(day, -3, DATEADD(hour, 2, GETUTCDATE()))),
        (21, 'Assigned to NOC technician', 1, DATEADD(day, -3, DATEADD(hour, 2, GETUTCDATE()))),
        (21, 'Partial mitigation applied', 3, DATEADD(day, -2, DATEADD(hour, 5, GETUTCDATE()))),
        (21, 'Status remains In Progress due to instability', 3, DATEADD(day, -1, DATEADD(hour, 6, GETUTCDATE()))),

        (29, 'Critical incident created by monitoring alert', 6, DATEADD(day, -6, DATEADD(minute, 5, GETUTCDATE()))),
        (29, 'SLA breach flag raised', 1, DATEADD(day, -5, DATEADD(hour, 5, GETUTCDATE()))),
        (29, 'Escalated to security response team', 1, DATEADD(day, -5, DATEADD(hour, 7, GETUTCDATE()))),
        (29, 'Certificate renewal initiated', 5, DATEADD(day, -5, DATEADD(hour, 8, GETUTCDATE()))),
        (29, 'Waiting for CA validation response', 5, DATEADD(day, -4, DATEADD(hour, 3, GETUTCDATE())));

    -- Additional general lifecycle events to exceed 50 audit rows.
    INSERT INTO AuditLogs (TicketId, Action, UserId, Timestamp)
    SELECT
        t.Id,
        'Status reviewed during daily standup',
        1,
        DATEADD(day, 1, t.CreatedAt)
    FROM Tickets t
    WHERE t.Id IN (2, 3, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 27, 28, 30);

    COMMIT TRANSACTION;

    PRINT 'Smart ITSM expanded demo dataset inserted successfully.';
    PRINT 'Includes: 30 tickets, 3 SLA breach examples, 50+ audit logs, 15 comments, 15 notifications.';
    PRINT 'Note: 3 dummy AI tickets are intentionally NOT inserted in DB for live Gemini prediction demo.';

    -- Quick validation snapshot
    SELECT 'Tickets' AS [Metric], COUNT(*) AS [Count] FROM Tickets
    UNION ALL SELECT 'SLA Breach Candidates (Open/In Progress/Pending & overdue due date)', COUNT(*) FROM Tickets WHERE StatusId IN (1, 2, 3, 6) AND DueDate < GETUTCDATE()
    UNION ALL SELECT 'AuditLogs', COUNT(*) FROM AuditLogs
    UNION ALL SELECT 'TicketComments', COUNT(*) FROM TicketComments
    UNION ALL SELECT 'ApprovalRequests', COUNT(*) FROM ApprovalRequests
    UNION ALL SELECT 'Notifications', COUNT(*) FROM Notifications
    UNION ALL SELECT 'Linked Asset Tickets', COUNT(*) FROM Tickets WHERE RelatedAssetId IS NOT NULL;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    DECLARE @Err NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrLine INT = ERROR_LINE();
    DECLARE @ErrNum INT = ERROR_NUMBER();

    RAISERROR('Seed script failed (Error %d, Line %d): %s', 16, 1, @ErrNum, @ErrLine, @Err);
END CATCH;
