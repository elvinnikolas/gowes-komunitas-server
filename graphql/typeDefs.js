const { gql } = require('apollo-server')

module.exports = gql`
    # TYPE
    type Post {
        _id: ID!
        user: ID!
        community: Community!
        name: String!
        title: String!
        date: String!
        content: String!
        likes: [Like]!
        dislikes: [Dislike]!
        comments: [Comment]!
        bookmarks: [Bookmark]!
        # likesCount: Int!
        # dislikesCount: Int!
        # commentsCount: Int!
    }

    type Like {
        _id: ID!
        user: ID!
    }

    type Dislike {
        _id: ID!
        user: ID!
    }

    type Bookmark {
        _id: ID!
        user: ID!
        date: String!
    }

    type Comment {
        _id: ID!
        user: ID!
        name: String!
        date: String!
        comment: String!
    }

    type User {
        _id: ID!
        name: String!
        username: String!
        bio: String
        email: String!
        password: String!
        date: String!
        token: String!
    }

    type Community {
        _id: ID!
        name: String!
        bio: String!
        date: String!
        city: String!
        province: String!
        isPrivate: Boolean!
        isActive: Boolean!
        memberCount: Int!
    }

    type Member {
        _id: ID!
        community: Community!
        user: User!
        date: String!
        isAdmin: Boolean!
        isJoin: Boolean!
        isRequest: Boolean!
    }

    type CommunityAndMemberStatus {
        _id: ID!
        name: String!
        bio: String!
        date: String!
        city: String!
        province: String!
        isPrivate: Boolean!
        isActive: Boolean!
        memberCount: Int!
        isAdmin: Boolean!
        isJoin: Boolean!
        isRequest: Boolean!
    }

    # INPUT
    input RegisterInput {
        name: String!
        email: String!
        password: String!
    }

    input ProfileInput {
        name: String!
        bio: String!
    }

    input CommunityInput {
        name: String!
        bio: String!
        city: String!
        province: String!
        isPrivate: Boolean!
    }

    # QUERY
    type Query {
        # post
        getPosts: [Post]
        getPost(postId: ID!): Post
        getBookmarkPosts: [Post]
        getUserCommunityPosts(communityId: ID!): [Post]
        getUserCommunitiesPosts: [Post]

        # user
        getUser(id: ID!): User
        getUserPosts(id: ID!): [Post]

        # community
        getCommunities: [Community]
        getCommunity(communityId: ID!): Community
        getCommunityPosts(communityId: ID!): [Post]
        getCommunityMembers(communityId: ID!): [Member]
        getCommunityMemberRequests(communityId: ID!): [Member]
        getUserCommunities(userId: ID!): [Member]
        getCommunityAndMemberStatus(userId: ID!, communityId: ID!): CommunityAndMemberStatus
        getMemberStatus(userId: ID!, communityId: ID!): Member
    }

    # MUTATION
    type Mutation {
        # user
        register(
            registerInput: RegisterInput
        ) : User!

        login(
            email: String!, 
            password: String!
        ) : User!

        editProfile(
            profileInput: ProfileInput
        ) : User!

        # post
        createPost(
            title: String!,
            content: String!,
            communityId: ID!
        ) : Post!

        deletePost(
            postId: ID!
        ) : String!

        addComment(
            postId: ID!,
            comment: String!
        ) : Post!

        deleteComment(
            postId: ID!
            commentId: ID!
        ) : Post!

        likePost(
            postId: ID!
        ) : Post!

        dislikePost(
            postId: ID!
        ) : Post!
        
        bookmarkPost(
            postId: ID!
        ) : Post!

        # community
        createCommunity(
            communityInput: CommunityInput
        ) : Community

        requestJoinCommunity(
            communityId: ID!
        ) : Member!

        joinCommunity(
            communityId: ID!
        ) : Member!

        leaveCommunity(
            communityId: ID!
        ) : String!

        acceptMember(
            communityId: ID!
            userId: ID!
        ) : Member!

        rejectMember(
            communityId: ID!
            userId: ID!
        ) : String!

        removeMember(
            communityId: ID!
            userId: ID!
        ) : String!

        appointAdmin(
            communityId: ID!
            userId: ID!
        ) : Member!

        deleteCommunityPost(
            postId: ID!
        ) : String!
    }
`