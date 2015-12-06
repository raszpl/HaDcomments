// ==UserScript==
// @name Hackahackaday
// @version 0.17
// @author Rasz_pl (citizenr@gmail.com)
// @namespace
// @description Comment system enthancement. Highlights new comments since last visit using red box, highlights own comments using green box.
// @include         http://hackaday.com/*
// ==/UserScript==
// Using localStorage to store "URL" = "newest comment seen, numer of comments last seen" key/value pair


window.addEventListener("load", myFunction,false);

function myFunction()
{

var photo = document.getElementById("search-2").children[1];
photo.id  = "newId";
document.getElementById("masthead").children[0].appendChild(photo); 

/*
var i;
var logit;
var page = document.getElementById("page");

for (i = 0; i < localStorage.length; i++)
 {
//    current_url = localStorage.key(i) + "=[" + localStorage.getItem(localStorage.key(i)) + "]<br>";
//     parseInt(localStorage.getItem(localStorage.key(i).split(' ')[0]), parseInt(stored.split(' ')[1])
//    alert(localStorage.key(i));
//    alert(localStorage.key(i).match(/http:\/\/hackaday.com\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/.*?\/(comment-page-[0-9]*?\/)?/)[0]);
//    page.innerHTML += localStorage.key(i) + "=[" + localStorage.getItem(localStorage.key(i)) + "]<br>";
//    if ((localStorage.key(i).match(/http:\/\/hackaday.com\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/.*?\/(comment-page-[0-9]*?\/)?/)) && (localStorage.key(i).match(/http:\/\/hackaday.com\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/.*?\/(comment-page-[0-9]*?\/)?/)[0] != localStorage.key(i)))
//        {
    logit += localStorage.key(i) + " " + localStorage.getItem(localStorage.key(i)) + "<br>";
//        }
}
page.innerHTML += logit;
*/

if (typeof(Storage) != "undefined")
 {

// lets load custom css
  css = 'li.new-comment-hack { border: 2px solid red !important;} li.your-own-hack { border: 5px solid green !important;}';
  head = document.head || document.getElementsByTagName('head')[0];
  style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet)
   { style.styleSheet.cssText = css; }
  else
   { style.appendChild(document.createTextNode(css)); }
  head.appendChild(style);

/*
  list = document.getElementsByClassName("entry-intro");
  i = list.length;
  while(i--)
   {
    comments_url = list[i].children[0].children[0].href.match(/(^[^#]*)/)[0];
    number_of_comments = parseInt(list[i].children[1].textContent.replace(/[^0-9.]/g, ""));
    comment_array = getallcomments(comments_url);
    if (number_of_comments > comment_array[1])
     {
      var font= document.createElement("font");
      font.setAttribute('style', 'color:red;');
      font.appendChild(document.createTextNode(" "+(number_of_comments - comment_array[1])+" Unread"));
      list[i].children[1].appendChild(font)
     }
   }
*/

  if ((document.location.href.indexOf('hackaday.com/blog/') !=-1) || (document.location.href.indexOf('hackaday.com/?s') !=-1))
   {
// alert( "blog or search page" );
    list = document.getElementsByClassName("comments-counts");
    i = list.length;
    while(i--)
     {
// pull total number of comments from localstorage for the list[i].href, check for multiple comment pages
      comment_array = getallcomments(list[i].href);
// isolate just the number of comments from "1 Comment/xx Comments" string
      number_of_comments = parseInt(list[i].textContent.replace(/[^0-9.]/g, ""));
  
// only interested in entries with unread comments
      if (number_of_comments > comment_array[1])
       {
        var font= document.createElement("font");
        font.setAttribute('style', 'color:red;');
        font.textContent = " "+(number_of_comments - comment_array[1])+" Unread";
        list[i].appendChild(font);
       }
     }

   }
  else
   {
// alert( "inside post" );

// match on string starting with http://hackaday.com/xxx/xx/xx/ up to first / or up to /comment-page-x/
    current_url = document.location.href.match(/http:\/\/hackaday.com\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/.*?\/(comment-page-[0-9]*?\/)?/)[0];
// pull number of comments from localstorage, 
// existence of comment-nav-below means multi paged comments
// comment_array = [latest_comment_date, number_of_comments_last_seen]
    if(document.getElementById("comment-nav-below") === null)
     {
      comment_array = getcomments(current_url);
     }
    else
     {
      comment_array = getallcomments(current_url);
     }
     comments = document.getElementsByClassName("comments-counts")[0];
// isolate just the number of comments from "1 Comment/xx Comments" string
    number_of_comments = parseInt(comments.textContent.replace(/[^0-9.]/g, ""));
    if (number_of_comments > comment_array[1])
     {
      var font= document.createElement("font");
      font.setAttribute('style', 'color:red;');
      font.textContent = " "+(number_of_comments - comment_array[1])+" Unread";
      comments.appendChild(font);
     }

    my_name_is = document.getElementById("author").value;
    list = document.getElementsByClassName("comment");
    comment_time_last = 0;
    i = list.length;
    nextcommenthash = false;
    while(i--)
     {

// alert(Date.parse(list[i].getElementsByTagName("time")[0].childNodes[0].nodeValue.replace(" at ", ' ')));
// alert(list[i].getElementsByClassName("comment-author")[0].getElementsByClassName("fn")[0].textContent);
//              <time datetime="2014-11-11T21:12:36+00:00">

// keep track of oldest comment on the page, this is the timestamp we will save at the end
      comment_time = parseInt(Date.parse(list[i].getElementsByTagName("time")[0].childNodes[0].nodeValue.replace(" at ", ' ')));
      if (comment_time > comment_time_last)
       {
        comment_time_last = comment_time;
       }

// color our own posts green, check other posts if they are new, color those red   
      if (my_name_is == list[i].getElementsByClassName("comment-author")[0].getElementsByClassName("fn")[0].textContent)
       {
        list[i].className += " your-own-hack";
       }
      else if (comment_time > comment_array[0])
       {
// alert( comment_time+" "+comment_array[0]);

// slide window to fresh comment, insert "Next unread" button
// we are going from the bottom up = last colored fresh comment will be the first
        if (nextcommenthash)
         {
          var font= document.createElement("a");
          font.setAttribute('style', 'color:red; text-align: right; width:50%; display:inline-block;');
          font.textContent = "Next unread";
          font.href = window.location.hash;
// OPTIONAL: this lets me scroll a little bit down instead of sliding to top of hash
          font.setAttribute('next-unread', window.location.hash);
          font.onclick = function() {window.location.hash = this.getAttribute('next-unread'); document.documentElement.scrollTop -= 200; return false; };
          list[i].children[0].children[0].children[1].appendChild(font);
         }
        nextcommenthash = true;
        window.location.hash = list[i].id;
        list[i].className += " new-comment-hack";
        }
     }


//    alert( current_url+" "+comment_time_last+" "+list.length+" "+list.length);
    try 
     {
      localStorage.setItem(current_url, comment_time_last+" "+list.length);  } 
      catch (e)
       {
        if (e == QUOTA_EXCEEDED_ERR) {
            alert("Error: Local Storage limit exceeded.");
        }
        else {
            alert("Error: Saving to local storage.");
        }
     }
   }
 }
}


function getcomments(url)
{
// alert( url);
var stored = localStorage.getItem(url);

if (stored === null)
 { return [2000000000000, 0]; }
else if (stored.indexOf(' ') ===-1)
 { return [parseInt(stored), 0]; }
else
 { return [parseInt(stored.split(' ')[0]), parseInt(stored.split(' ')[1])]; }
}

function getallcomments(url)
{
// return latest_comment_date for current url
// return number_of_comments_last_seen for all possible comment sub pages

// we start with current page url
var latest_comment_date = getcomments(url)[0];
clean_url = url.match(/http:\/\/hackaday.com\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/.*?\//)[0];
var number_of_comments_last_seen = getcomments(clean_url)[1];
// check if there are multiple comment pages
var index = 2;
while (true)
 {
  if ((localStorage.getItem(clean_url+"comment-page-"+index+"/") !== null) )
   {
    number_of_comments_last_seen = number_of_comments_last_seen + parseInt(localStorage.getItem(clean_url+"comment-page-"+index+"/").split(' ')[1]);
    index++;
   }
  else
   {
    break; 
   }
 }

	
// match on string starting with http://hackaday.com/xxx/xx/xx/ up to first /, this is first page of every article
//matched_url = url.match(/http:\/\/hackaday.com\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/.*?\//)[0];
//alert(matched_url);
//latest_comment_date = getcomments(matched_url)[0];


//url1 = url.match(/http:\/\/hackaday.com\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/.*?\//)[0];
//alert(url1);
//number_of_comments_last_seen =  getcomments(url1)[1];
//alert(number_of_comments_last_seen);

// match on string starting with http://hackaday.com/xxx/xx/xx/ up to first /  /comment-page-x/
// current_url = document.location.href.match(/http:\/\/hackaday.com\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/.*?\//)[0];
// url1 = url.match(/http:\/\/hackaday.com\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/.*?\/comment-page-[0-9]*?\//)[0]; ok
// hackaday.com/[0-9]{4}/[0-9]{2}/[0-9]{2}/.*?/+(comment-page-[0-9]*?/)?
// ^http://hackaday.com/[0-9]{4}/[0-9]{2}/[0-9]{2}/.*?/comment-page-[0-9]*?/

return [latest_comment_date, number_of_comments_last_seen];
}

