# HaDcomments
Hackaday comment system enthancement userscript. I wrote it for myslef couple of years ago. At first it was just a primitive unread counter, but grew over the course of last year to include comment coloring, auto scrolling, and keeping track over multi page comments.

### Enthancements ###

- Displays number of unread comments right next to standard comment counter.

![comment count](https://raw.github.com/raszpl/HaDcomments/master/comment1.png)

- Your own comments are highlighted with a green frame.

![own comment](https://raw.github.com/raszpl/HaDcomments/master/comment3.png)

- New comments are accentuated by a red frame.

![new comments](https://raw.github.com/raszpl/HaDcomments/master/comment2.png)

- Opening previously read article with new comments automatically scrolls to first unread comment.
- "Next unread" button inside new comment frame scrolls to the next unread comment.
- Uses localStorage to store "URL" = "newest comment timestamp, numer of comments last seen" key/value pair.


Designed and tested solely on Opera 12.x
