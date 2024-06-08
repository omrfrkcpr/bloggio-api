Bloggio Backend TODO:

- implement database for stats based on userId (total likes-comments-visibility/bookmarks)
- add new subcollection into each blog response (bookmarks : ["userId", ...]) like (Likes or Comments)
- change request method for comment list (GET) ==> baseURL/comments/{blogId}
- add also user firstname + lastname inside each blog object (response GET blogs)
- change adding method (reverse) ==> new contents must be added at the top of the old contents (as prependChild)
