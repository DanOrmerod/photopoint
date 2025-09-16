USE [PhotoPoint-v1]
GO
/****** Object:  Table [dbo].[Account]    Script Date: 7/09/2025 3:00:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Account](
	[Id] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_Account] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Album]    Script Date: 7/09/2025 3:00:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Album](
	[Id] [uniqueidentifier] NOT NULL,
	[UserId] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
	[Description] [nvarchar](1000) NULL,
	[CoverPhotoId] [uniqueidentifier] NULL,
	[IsPublic] [bit] NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_Albums] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ContentBlock]    Script Date: 7/09/2025 3:00:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ContentBlock](
	[Id] [uniqueidentifier] NOT NULL,
	[PageId] [uniqueidentifier] NOT NULL,
	[Type] [nvarchar](50) NOT NULL,
	[Content] [nvarchar](max) NOT NULL,
	[SortOrder] [int] NOT NULL,
	[Settings] [nvarchar](max) NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_ContentBlocks] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MediaFile]    Script Date: 7/09/2025 3:00:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MediaFile](
	[Id] [uniqueidentifier] NOT NULL,
	[FolderId] [uniqueidentifier] NULL,
	[OriginalName] [nvarchar](500) NOT NULL,
	[FileName] [nvarchar](500) NOT NULL,
	[BlobPath] [nvarchar](1000) NOT NULL,
	[BlobUrl] [nvarchar](2000) NOT NULL,
	[FileSize] [bigint] NOT NULL,
	[MimeType] [nvarchar](100) NOT NULL,
	[FileType] [nvarchar](20) NOT NULL,
	[Width] [int] NULL,
	[Height] [int] NULL,
	[DurationSeconds] [decimal](10, 2) NULL,
	[Tags] [nvarchar](max) NULL,
	[AltText] [nvarchar](500) NULL,
	[Description] [nvarchar](max) NULL,
	[IsPublic] [bit] NULL,
	[IsDeleted] [bit] NULL,
	[CreatedAt] [datetime2](7) NULL,
	[UpdatedAt] [datetime2](7) NULL,
	[ThumbnailUrl] [nvarchar](2000) NULL,
	[ThumbnailBlobPath] [nvarchar](1000) NULL,
	[HasThumbnail] [bit] NULL,
	[ThumbnailData] [varbinary](max) NULL,
	[ThumbnailContentType] [nvarchar](100) NULL,
	[AccountId] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_MediaFile] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_MediaFile_BlobPath] UNIQUE NONCLUSTERED 
(
	[BlobPath] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_MediaFile_BlobUrl] UNIQUE NONCLUSTERED 
(
	[BlobUrl] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MediaFolder]    Script Date: 7/09/2025 3:00:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MediaFolder](
	[Id] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
	[ParentId] [uniqueidentifier] NULL,
	[AccountId] [uniqueidentifier] NOT NULL,
	[CreatedAt] [datetime2](7) NULL,
	[UpdatedAt] [datetime2](7) NULL,
	[IsDeleted] [bit] NULL,
	[AllowWebsiteUsage] [bit] NULL,
	[WebsiteUsagePermissions] [nvarchar](20) NULL,
	[Description] [nvarchar](max) NULL,
	[Tags] [nvarchar](max) NULL,
 CONSTRAINT [PK__MediaFolder] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MediaFolderWebsitePermission]    Script Date: 7/09/2025 3:00:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MediaFolderWebsitePermission](
	[Id] [uniqueidentifier] NOT NULL,
	[FolderId] [uniqueidentifier] NOT NULL,
	[WebsiteId] [uniqueidentifier] NOT NULL,
	[PermissionType] [nvarchar](20) NOT NULL,
	[GrantedBy] [uniqueidentifier] NOT NULL,
	[CreatedAt] [datetime2](7) NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_folder_website_permission] UNIQUE NONCLUSTERED 
(
	[FolderId] ASC,
	[WebsiteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MediaUsage]    Script Date: 7/09/2025 3:00:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MediaUsage](
	[Id] [uniqueidentifier] NOT NULL,
	[MediaFileId] [uniqueidentifier] NOT NULL,
	[WebsiteId] [uniqueidentifier] NULL,
	[PageId] [uniqueidentifier] NULL,
	[BlockId] [uniqueidentifier] NULL,
	[UsageType] [nvarchar](50) NOT NULL,
	[CreatedAt] [datetime2](7) NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Page]    Script Date: 7/09/2025 3:00:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Page](
	[Id] [uniqueidentifier] NOT NULL,
	[WebsiteId] [uniqueidentifier] NOT NULL,
	[Title] [nvarchar](255) NOT NULL,
	[Slug] [nvarchar](255) NOT NULL,
	[IsHomePage] [bit] NOT NULL,
	[Content] [nvarchar](max) NULL,
	[MetaTitle] [nvarchar](255) NULL,
	[MetaDescription] [nvarchar](500) NULL,
	[Status] [nvarchar](20) NOT NULL,
	[ParentId] [uniqueidentifier] NULL,
	[SortOrder] [int] NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
	[PublishedAt] [datetime2](7) NULL,
 CONSTRAINT [PK_Pages] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Pages_Website_Slug] UNIQUE NONCLUSTERED 
(
	[WebsiteId] ASC,
	[Slug] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Photo]    Script Date: 7/09/2025 3:00:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Photo](
	[Id] [uniqueidentifier] NOT NULL,
	[FileName] [nvarchar](255) NOT NULL,
	[OriginalName] [nvarchar](255) NOT NULL,
	[MimeType] [nvarchar](100) NOT NULL,
	[Size] [bigint] NOT NULL,
	[Url] [nvarchar](500) NOT NULL,
	[ThumbnailUrl] [nvarchar](500) NULL,
	[Width] [int] NULL,
	[Height] [int] NULL,
	[Camera] [nvarchar](255) NULL,
	[Location] [nvarchar](255) NULL,
	[Tags] [nvarchar](max) NULL,
	[Description] [nvarchar](1000) NULL,
	[IsPublic] [bit] NOT NULL,
	[IsFavorite] [bit] NOT NULL,
	[UploadedAt] [datetime2](7) NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
	[AccountId] [uniqueidentifier] NULL,
 CONSTRAINT [PK_Photos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[User]    Script Date: 7/09/2025 3:00:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[User](
	[Id] [uniqueidentifier] NOT NULL,
	[Email] [nvarchar](255) NOT NULL,
	[PasswordHash] [nvarchar](255) NULL,
	[FirstName] [nvarchar](100) NULL,
	[LastName] [nvarchar](100) NULL,
	[IsActive] [bit] NOT NULL,
	[IsEmailVerified] [bit] NOT NULL,
	[LastLoginAt] [datetime2](7) NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
	[Username] [nvarchar](100) NULL,
	[FullName] [nvarchar](200) NULL,
	[ProfilePicture] [nvarchar](500) NULL,
	[GoogleId] [nvarchar](100) NULL,
	[FacebookId] [nvarchar](100) NULL,
	[AppleId] [nvarchar](100) NULL,
 CONSTRAINT [PK_User] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Users_Email] UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserAccount]    Script Date: 7/09/2025 3:00:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserAccount](
	[Id] [uniqueidentifier] NOT NULL,
	[UserId] [uniqueidentifier] NOT NULL,
	[AccountId] [uniqueidentifier] NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_UserAccount] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_UserAccount] UNIQUE NONCLUSTERED 
(
	[UserId] ASC,
	[AccountId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Website]    Script Date: 7/09/2025 3:00:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Website](
	[Id] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
	[Domain] [nvarchar](255) NULL,
	[Subdomain] [nvarchar](100) NOT NULL,
	[Status] [nvarchar](20) NOT NULL,
	[Theme] [nvarchar](50) NOT NULL,
	[Settings] [nvarchar](max) NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
	[LastPublishedAt] [datetime2](7) NULL,
	[AccountId] [uniqueidentifier] NULL,
 CONSTRAINT [PK_Website] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Website_Domain] UNIQUE NONCLUSTERED 
(
	[Domain] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Website_Subdomain] UNIQUE NONCLUSTERED 
(
	[Subdomain] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WebsiteMedia]    Script Date: 7/09/2025 3:00:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WebsiteMedia](
	[Id] [uniqueidentifier] NOT NULL,
	[WebsiteId] [uniqueidentifier] NOT NULL,
	[FileName] [nvarchar](255) NOT NULL,
	[OriginalName] [nvarchar](255) NOT NULL,
	[FileSize] [bigint] NOT NULL,
	[MimeType] [nvarchar](100) NOT NULL,
	[FileUrl] [nvarchar](500) NOT NULL,
	[Alt] [nvarchar](255) NULL,
	[Description] [nvarchar](1000) NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_WebsiteMedia] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Account] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[Account] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Account] ADD  DEFAULT (getutcdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Album] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[Album] ADD  DEFAULT ((0)) FOR [IsPublic]
GO
ALTER TABLE [dbo].[Album] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Album] ADD  DEFAULT (getutcdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[ContentBlock] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[ContentBlock] ADD  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[ContentBlock] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[ContentBlock] ADD  DEFAULT (getutcdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[MediaFile] ADD  CONSTRAINT [DF__media_file__id__30C33EC3]  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[MediaFile] ADD  DEFAULT ((0)) FOR [IsPublic]
GO
ALTER TABLE [dbo].[MediaFile] ADD  DEFAULT ((0)) FOR [IsDeleted]
GO
ALTER TABLE [dbo].[MediaFile] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[MediaFile] ADD  DEFAULT (getutcdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[MediaFile] ADD  DEFAULT ((0)) FOR [HasThumbnail]
GO
ALTER TABLE [dbo].[MediaFolder] ADD  CONSTRAINT [DF_MediaFolder_IsDeleted]  DEFAULT ((0)) FOR [IsDeleted]
GO
ALTER TABLE [dbo].[MediaFolderWebsitePermission] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[MediaFolderWebsitePermission] ADD  CONSTRAINT [DF_MediaFolderWebsitePermission_PermissionType]  DEFAULT ('read') FOR [PermissionType]
GO
ALTER TABLE [dbo].[MediaFolderWebsitePermission] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[MediaFolderWebsitePermission] ADD  DEFAULT (getutcdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[MediaUsage] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[MediaUsage] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[MediaUsage] ADD  DEFAULT (getutcdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Page] ADD  CONSTRAINT [DF__Pages__Id__534D60F1]  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[Page] ADD  CONSTRAINT [DF_Pages_IsHomePage]  DEFAULT ((0)) FOR [IsHomePage]
GO
ALTER TABLE [dbo].[Page] ADD  CONSTRAINT [DF__Pages__Status__5441852A]  DEFAULT ('draft') FOR [Status]
GO
ALTER TABLE [dbo].[Page] ADD  CONSTRAINT [DF__Pages__SortOrder__5535A963]  DEFAULT ((0)) FOR [SortOrder]
GO
ALTER TABLE [dbo].[Page] ADD  CONSTRAINT [DF__Pages__CreatedAt__5629CD9C]  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Page] ADD  CONSTRAINT [DF__Pages__UpdatedAt__571DF1D5]  DEFAULT (getutcdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Photo] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[Photo] ADD  DEFAULT ((0)) FOR [IsPublic]
GO
ALTER TABLE [dbo].[Photo] ADD  DEFAULT ((0)) FOR [IsFavorite]
GO
ALTER TABLE [dbo].[Photo] ADD  DEFAULT (getutcdate()) FOR [UploadedAt]
GO
ALTER TABLE [dbo].[Photo] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Photo] ADD  DEFAULT (getutcdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[User] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[User] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[User] ADD  DEFAULT ((0)) FOR [IsEmailVerified]
GO
ALTER TABLE [dbo].[User] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[User] ADD  DEFAULT (getutcdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[UserAccount] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[UserAccount] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[UserAccount] ADD  DEFAULT (getutcdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Website] ADD  CONSTRAINT [DF__Websites__Id__49C3F6B7]  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[Website] ADD  CONSTRAINT [DF__Websites__Status__4AB81AF0]  DEFAULT ('draft') FOR [Status]
GO
ALTER TABLE [dbo].[Website] ADD  CONSTRAINT [DF__Websites__Theme__4BAC3F29]  DEFAULT ('default') FOR [Theme]
GO
ALTER TABLE [dbo].[Website] ADD  CONSTRAINT [DF__Websites__Create__4CA06362]  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Website] ADD  CONSTRAINT [DF__Websites__Update__4D94879B]  DEFAULT (getutcdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[WebsiteMedia] ADD  DEFAULT (newid()) FOR [Id]
GO
ALTER TABLE [dbo].[WebsiteMedia] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[WebsiteMedia] ADD  DEFAULT (getutcdate()) FOR [UpdatedAt]
GO
ALTER TABLE [dbo].[Album]  WITH CHECK ADD  CONSTRAINT [FK_Album_User] FOREIGN KEY([UserId])
REFERENCES [dbo].[User] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Album] CHECK CONSTRAINT [FK_Album_User]
GO
ALTER TABLE [dbo].[Album]  WITH CHECK ADD  CONSTRAINT [FK_Albums_CoverPhoto] FOREIGN KEY([CoverPhotoId])
REFERENCES [dbo].[Photo] ([Id])
GO
ALTER TABLE [dbo].[Album] CHECK CONSTRAINT [FK_Albums_CoverPhoto]
GO
ALTER TABLE [dbo].[ContentBlock]  WITH CHECK ADD  CONSTRAINT [FK_ContentBlocks_Pages] FOREIGN KEY([PageId])
REFERENCES [dbo].[Page] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ContentBlock] CHECK CONSTRAINT [FK_ContentBlocks_Pages]
GO
ALTER TABLE [dbo].[MediaFile]  WITH CHECK ADD  CONSTRAINT [FK_media_file_folder] FOREIGN KEY([FolderId])
REFERENCES [dbo].[MediaFolder] ([Id])
GO
ALTER TABLE [dbo].[MediaFile] CHECK CONSTRAINT [FK_media_file_folder]
GO
ALTER TABLE [dbo].[MediaFile]  WITH CHECK ADD  CONSTRAINT [FK_MediaFile_Account] FOREIGN KEY([AccountId])
REFERENCES [dbo].[Account] ([Id])
GO
ALTER TABLE [dbo].[MediaFile] CHECK CONSTRAINT [FK_MediaFile_Account]
GO
ALTER TABLE [dbo].[MediaFolder]  WITH CHECK ADD  CONSTRAINT [FK_MediaFolder_Account] FOREIGN KEY([AccountId])
REFERENCES [dbo].[Account] ([Id])
GO
ALTER TABLE [dbo].[MediaFolder] CHECK CONSTRAINT [FK_MediaFolder_Account]
GO
ALTER TABLE [dbo].[MediaFolderWebsitePermission]  WITH CHECK ADD  CONSTRAINT [FK_folder_website_perms_folder] FOREIGN KEY([FolderId])
REFERENCES [dbo].[MediaFolder] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[MediaFolderWebsitePermission] CHECK CONSTRAINT [FK_folder_website_perms_folder]
GO
ALTER TABLE [dbo].[MediaFolderWebsitePermission]  WITH CHECK ADD  CONSTRAINT [FK_folder_website_perms_website] FOREIGN KEY([WebsiteId])
REFERENCES [dbo].[Website] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[MediaFolderWebsitePermission] CHECK CONSTRAINT [FK_folder_website_perms_website]
GO
ALTER TABLE [dbo].[MediaFolderWebsitePermission]  WITH CHECK ADD  CONSTRAINT [FK_MediaFolderWebsitePerm_GrantedBy] FOREIGN KEY([GrantedBy])
REFERENCES [dbo].[User] ([Id])
GO
ALTER TABLE [dbo].[MediaFolderWebsitePermission] CHECK CONSTRAINT [FK_MediaFolderWebsitePerm_GrantedBy]
GO
ALTER TABLE [dbo].[MediaUsage]  WITH CHECK ADD  CONSTRAINT [FK_MediaUsage_Block] FOREIGN KEY([BlockId])
REFERENCES [dbo].[ContentBlock] ([Id])
GO
ALTER TABLE [dbo].[MediaUsage] CHECK CONSTRAINT [FK_MediaUsage_Block]
GO
ALTER TABLE [dbo].[MediaUsage]  WITH CHECK ADD  CONSTRAINT [FK_MediaUsage_File] FOREIGN KEY([MediaFileId])
REFERENCES [dbo].[MediaFile] ([Id])
GO
ALTER TABLE [dbo].[MediaUsage] CHECK CONSTRAINT [FK_MediaUsage_File]
GO
ALTER TABLE [dbo].[MediaUsage]  WITH CHECK ADD  CONSTRAINT [FK_MediaUsage_Page] FOREIGN KEY([PageId])
REFERENCES [dbo].[Page] ([Id])
GO
ALTER TABLE [dbo].[MediaUsage] CHECK CONSTRAINT [FK_MediaUsage_Page]
GO
ALTER TABLE [dbo].[MediaUsage]  WITH CHECK ADD  CONSTRAINT [FK_MediaUsage_Website] FOREIGN KEY([WebsiteId])
REFERENCES [dbo].[Website] ([Id])
GO
ALTER TABLE [dbo].[MediaUsage] CHECK CONSTRAINT [FK_MediaUsage_Website]
GO
ALTER TABLE [dbo].[Page]  WITH CHECK ADD  CONSTRAINT [FK_Pages_Parent] FOREIGN KEY([ParentId])
REFERENCES [dbo].[Page] ([Id])
GO
ALTER TABLE [dbo].[Page] CHECK CONSTRAINT [FK_Pages_Parent]
GO
ALTER TABLE [dbo].[Page]  WITH CHECK ADD  CONSTRAINT [FK_Pages_Websites] FOREIGN KEY([WebsiteId])
REFERENCES [dbo].[Website] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Page] CHECK CONSTRAINT [FK_Pages_Websites]
GO
ALTER TABLE [dbo].[UserAccount]  WITH CHECK ADD  CONSTRAINT [FK_UserAccount_Account] FOREIGN KEY([AccountId])
REFERENCES [dbo].[Account] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserAccount] CHECK CONSTRAINT [FK_UserAccount_Account]
GO
ALTER TABLE [dbo].[UserAccount]  WITH CHECK ADD  CONSTRAINT [FK_UserAccount_User] FOREIGN KEY([UserId])
REFERENCES [dbo].[User] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserAccount] CHECK CONSTRAINT [FK_UserAccount_User]
GO
ALTER TABLE [dbo].[Website]  WITH CHECK ADD  CONSTRAINT [FK_Website_Account] FOREIGN KEY([AccountId])
REFERENCES [dbo].[Account] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Website] CHECK CONSTRAINT [FK_Website_Account]
GO
ALTER TABLE [dbo].[WebsiteMedia]  WITH CHECK ADD  CONSTRAINT [FK_WebsiteMedia_Websites] FOREIGN KEY([WebsiteId])
REFERENCES [dbo].[Website] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[WebsiteMedia] CHECK CONSTRAINT [FK_WebsiteMedia_Websites]
GO
ALTER TABLE [dbo].[MediaFile]  WITH CHECK ADD  CONSTRAINT [CK_media_file_type] CHECK  (([FileType]='image' OR [FileType]='video'))
GO
ALTER TABLE [dbo].[MediaFile] CHECK CONSTRAINT [CK_media_file_type]
GO
ALTER TABLE [dbo].[MediaFolderWebsitePermission]  WITH CHECK ADD  CONSTRAINT [CK__media_fol__permi__489AC854] CHECK  (([PermissionType]='read_write' OR [PermissionType]='read'))
GO
ALTER TABLE [dbo].[MediaFolderWebsitePermission] CHECK CONSTRAINT [CK__media_fol__permi__489AC854]
GO
ALTER TABLE [dbo].[Page]  WITH CHECK ADD  CONSTRAINT [CK_Pages_Status] CHECK  (([Status]='archived' OR [Status]='published' OR [Status]='draft'))
GO
ALTER TABLE [dbo].[Page] CHECK CONSTRAINT [CK_Pages_Status]
GO
ALTER TABLE [dbo].[Website]  WITH CHECK ADD  CONSTRAINT [CK_Websites_Status] CHECK  (([Status]='suspended' OR [Status]='inactive' OR [Status]='active' OR [Status]='draft'))
GO
ALTER TABLE [dbo].[Website] CHECK CONSTRAINT [CK_Websites_Status]
GO
