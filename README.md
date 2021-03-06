# HaDcomments
Hackaday comment system enthancement userscript I wrote couple of years ago. At first it was just a primitive unread counter, but grew over the course of 2015 to include comment coloring, auto scrolling, and keeping track over multi page comments. In 2017 I added a panel to monitor all visited blog posts with corresponding comment/unread stats, and to easily pull for new comments without directly visiting those links.

### Enthancements ###

- Displays number of unread comments right next to standard comment counter.

![comment count](https://raw.github.com/raszpl/HaDcomments/master/comment1.png)

- New comments are accentuated by a red frame.
- Opening previously read article with new comments automatically scrolls to first unread comment.
- Red "Next unread" link inside new comment frame scrolls to the next unread comment.

![new comments](https://raw.github.com/raszpl/HaDcomments/master/comment2.png)

- Your own comments are highlighted with a green frame.

![own comment](https://raw.github.com/raszpl/HaDcomments/master/comment3.png)

- Yellow COMMENTS button next to Search opens Comments panel.
- Comments panel lists previously read posts.
- "mine" checkbox can filters for only posts you comment in(green rows).
- Slider controls number of rows.
- Clicking UPDATE fetches all currently displayed (and older than 60 minutes) comments using AJAX (careful, havent implemented throttling yet).
- You can also manually force update selected row by clicking inside "last check" column.

![panel](https://raw.github.com/raszpl/HaDcomments/master/history.png)


- Gets rid of sidebar and resizes content to full width of the screen.


Designed and tested on Opera 12.x (native userjs) and Chrome/Vivaldi/Opera using Tampermonkey.
Uses localStorage to store "URL" = "newest comment timestamp, comments last seen, my comments, check date, unread comments, unread replies to my comments" key/value pair.
