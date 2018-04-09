// ==UserScript==
// @name         HaDcomments
// @description  Comment system enthancement. Highlights new comments since last visit using red box, highlights own comments using green box.
//               Gets rid of the sidebar, uses whole width of the screen for content, adds "history" button to preview all posts you read and commented on.
//               History panel also lets you check for new comments without loading older posts.
// @author       Rasz_pl
// @version      0.19
// @date         2018-04-09
// @namespace    https://github.com/raszpl/HaDcomments
// @contact      citizenr@gmail.com
// @license      MIT; http://opensource.org/licenses/MIT
// @homepageURL  https://github.com/raszpl/HaDcomments
// @supportURL   https://github.com/raszpl/HaDcomments/issues
// @downloadURL  https://github.com/raszpl/HaDcomments/raw/master/HaDcomments.user.js
// @include      http://hackaday.com/*
// @include      https://hackaday.com/*
// @grant        none
// @run-at document-start
// ==/UserScript==

// lets load custom css
    css = '.widget-area {width: 20% !important;}';
    css += '.loggedout-follow-normal {display: none !important;}';
    css += '.content-area {margin-left: 0.2% !important; margin-right: 0.2% !important; width: 99.6% !important;}';
    css += '.comment-list .comment {margin: 0px 0px 0px !important; padding: 2px !important;}';
    css += '.post {margin-left: 0px !important; margin-right: 0px !important;}';
    css += '#content {padding-left: 0px !important; width: 100% !important;}';
    css += '#colophon, #secondary {display:none !important; height:0px !important; visibility:hidden !important; border:0 !important;}';
    css += 'li.new-comment-hack {border: 2px solid red !important;} li.your-own-hack {border: 5px solid green !important;} #theData table, td, th {border-collapse: collapse; border: 1px solid white !important;}';
    css += 'tr.your-own {background-color: rgba(8, 65, 13, 0.65);}';
    css += 'tr.your-selected {background-color: rgba(100, 9, 13, 0.65);}';
    css += '.btn, .btn:active, .btn:hover, .btn:focus {color: #000; background-color: #F3BF10; !important;}';
    css += 'tr, th, td {vertical-align: top !important;}';
    css += '.unred {color: red;}';
    css += '.post-navigation {width: 100%;}';
    css += 'body, button, input, select, textarea {line-height: 1.2 !important;}';

    head = document.head || document.getElementsByTagName('head')[0];
    style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet)
    {
      style.styleSheet.cssText = css;
    }
    else
    {
      style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);


window.addEventListener("load", function (e){
  if (document.getElementById("search-2"))
  {
    var element = document.getElementById("search-2").children[1];
    element.id  = "newId";
    element.style = "float: left;";
    document.getElementById("masthead").children[0].appendChild(element);
  }

// <div class="content-ads-holder">
  link = document.getElementsByClassName("content-ads-holder");
  for (i = 0; i < link.length; ++i)
  {
    link[i].parentNode.removeChild(link[i]);
  }

// <div id="leaderboard">
  if (document.getElementById("leaderboard"))
  {
    document.getElementById("leaderboard").parentNode.removeChild(document.getElementById("leaderboard"));
  }
//main

  var theData = document.createElement('div');
  	theData.id = "theData";
  document.getElementById("main").parentNode.insertBefore(theData, document.getElementById("main"));

  var theForm = document.createElement('form');
  	theForm.name = "theForm";
  	theForm.id = "theForm";
  	theForm.innerHTML = [
      "<button id='bfilltheData' class='btn'>history</button>",
      "<label><input type='checkbox' checked='checked' id='scope1' /> mine </label>",
      "<input type='range' id='range1' value='10' min='0' max='"+localStorage.length+"' /><label id='range2'> 10 </label>"
// unused at this time, I had some plans for bulk updating of counters, but its not exactly on the top of my todo list
//      ,
//      "<button id='bloadtheData' class='btn'>update</button>",
//      "<label><input type='checkbox' id='scope2' /> all </label>",
//      "<button id='brefactorData' class='btn'> __ </button>"
    ].join('');
  document.getElementById("masthead").children[0].appendChild(theForm);

  bfilltheData.onclick = function(){ bfilltheData.value ^= true; filltheData(); return false; };
  scope1.onclick = function(){ filltheData(); };
  range1.onmousemove = function(){ range2.innerHTML = range1.value +" "; };
  range1.onmouseup = function(){ filltheData(); };
//  bloadtheData.onclick = function(){ loadtheData(); return false; };
//  brefactorData.onclick = function(){ refactorData(); return false; };

  if (typeof(Storage) != "undefined")
  {

    if ((document.location.href.indexOf('hackaday.com/blog/') !=-1) || (document.location.href.indexOf('hackaday.com/?s') !=-1))
    {
  // alert( "blog or search page" );
      list = document.getElementsByClassName("comments-counts");
      i = list.length;
      while(i--)
      {
  // pull total number of comments from localstorage for the list[i].href, check for multiple comment pages
        comment_array = getallcomments(list[i].href.match("^https?://hackaday.com/([0-9]{4}/[0-9]{2}/[0-9]{2}/.*?/)")[1]);
  // isolate just the number of comments from "1 Comment/xx Comments" string
        number_of_comments = parseInt(list[i].textContent.replace(/[^0-9]/g, ""));
  // only interested in entries with unread comments
        if (number_of_comments > comment_array[1])
        {
          var unred = document.createElement("span");
          unred.className = "unred";
          unred.textContent = " "+(number_of_comments - comment_array[1])+" Unread";
          list[i].appendChild(unred);
        }
      }

    }
    else
    {
  // alert( "inside post" );

  // match on string starting with http://hackaday.com/xxx/xx/xx/ up to first / or up to /comment-page-x/
      current_url = document.location.href.match("^https?://hackaday.com/([0-9]{4}/[0-9]{2}/[0-9]{2}/.*?/(comment-page-[0-9]*?/)?)")[1];
  // pull number of comments from localstorage,
  // existence of comment-nav-below means multi paged comments
  // comment_array = [latest_comment_date, number_of_comments_last_seen]
      if(document.getElementById("comment-nav-below") === null)
      {
        comment_array = getcomment(current_url);
      }
      else
      {
        comment_array = getallcomments(current_url);
      }
       comments = document.getElementsByClassName("comments-counts")[0];
  // isolate just the number of comments from "1 Comment/xx Comments" string
      number_of_comments = parseInt(comments.textContent.replace(/[^0-9]/g, ""));
      if (number_of_comments > comment_array[1])
      {
        var unred = document.createElement("span");
        unred.className = "unred";
        unred.textContent = " "+(number_of_comments - comment_array[1])+" Unread";
        comments.appendChild(unred);
      }

      my_name_is = document.getElementById("author").value;
      list = document.getElementsByClassName("comment");
      i = list.length;
      comment_time_last = comment_array[0];
      my_comments = 0;
      nextcommenthash = false;
      while(i--)
      {

// alert(Date.parse(list[i].getElementsByTagName("time")[0].childNodes[0].nodeValue.replace(" at ", ' ')));
  // alert(list[i].getElementsByClassName("comment-author")[0].getElementsByClassName("fn")[0].textContent);
  //              <time datetime="2014-11-11T21:12:36+00:00">

  // keep track of oldest comment on the page, this is the timestamp we will save at the end
        comment_time = parseInt(Date.parse(list[i].getElementsByTagName("time")[0].childNodes[0].nodeValue.replace(" at ", ' '))/10000);
        if (comment_time > comment_time_last)
        {
          comment_time_last = comment_time;
        }

  // color our own posts green, check other posts if they are new, color those red
        if (my_name_is == list[i].getElementsByClassName("comment-author")[0].getElementsByClassName("fn")[0].textContent)
        {
          list[i].className += " your-own-hack";
          my_comments++;
        }
        else if ((comment_time > comment_array[0]) && (comment_array[0]>0))
        {
  // alert( comment_time+" "+comment_array[0]);

  // slide window to fresh comment, insert "Next unread" button
  // we are going from the bottom up = last colored fresh comment will be the first
          if (nextcommenthash)
          {
            var font= document.createElement("a");
            font.setAttribute('style', 'color:red; text-align: right; width:50%; display:inline-block;');
            font.textContent = "Next unread";
            font.href = nextcommenthash;
  // OPTIONAL: document.body.scrollTop -= 200 lets me scroll a little bit down instead of sliding to top of hash
            font.setAttribute('next-unread', nextcommenthash);
            font.onclick = function() {window.location.hash = this.getAttribute('next-unread'); document.body.scrollTop -= 200; return false; };
            list[i].children[0].children[0].children[1].appendChild(font);
          }
          nextcommenthash = list[i].id;
          //window.location.hash = list[i].id;
          list[i].className += " new-comment-hack";
        }
      }
      if (nextcommenthash)
        {
          window.location.hash = nextcommenthash;
        }
// comment_time_last = current date if we are seeing it for the first time and there are no comments
    comment_time_last = (list.length>0) ? comment_time_last : parseInt(Date.parse(Date())/10000);
//console.log(current_url, comment_time_last, list.length, my_comments, parseInt(Date.parse(Date())/10000), "0", "0");
//"url, comments last seen, all comments, my comments, check date, unread comments, unread replies to my comments"
    setcomment(current_url, comment_time_last, list.length, my_comments, parseInt(Date.parse(Date())/10000), "0", "0");
    }
  }
}, false);

function filltheData() {
  var start = new Date().getTime();
  var logit = [];
  var line = 0;
  var now = parseInt(Date.parse(Date())/10000);

  function updaterow(row) {
    var hr = new XMLHttpRequest();
    var now = parseInt(Date.parse(Date())/10000);
    var url = document.getElementById("thedataurl"+row).innerText;
    hr.onreadystatechange = function ()
      {
      if(hr.readyState === 4 && hr.status === 200)
        {
          insidepost(hr, row, url);
        }
      };
    hr.open("GET", url, true);
    hr.send();
  }

  function printtime(data) {
    data = now - data;
    if (data < 360) { return Math.round(data/6) + " min.";} else
    if (data < 8640) { return Math.round(data/360) + " hours";} else
    if (data < 60480) { return Math.round(data/8640) + " days";} else
    if (data < 262974) { return Math.round(data/60480) + " weeks";} else
    if (data < 3155692) { return Math.round(data/262974) + " months";} else
      return Math.round(data/3155692) + " years";
  }

  //document.getElementById("myRange").value;
//  var scope= document.querySelector('input[name=scope]:checked').value;
  var scope = document.getElementById("scope1").checked;
//  var range= (document.querySelector('input[name=range]:checked').value > localStorage.length) ? localStorage.length : document.querySelector('input[name=range]:checked').value;
  var range = document.querySelector('input[name=range]:checked') ? (document.querySelector('input[name=range]:checked').value > localStorage.length) ? localStorage.length : document.querySelector('input[name=range]:checked').value :
  document.getElementById("range1").value;

  if (document.getElementById("theDataTable"))
  {
    document.getElementById("theDataTable").parentNode.removeChild(document.getElementById("theDataTable"));
  }

  if (document.getElementById('bfilltheData').value == true)
  {
    var tbl = document.createElement('table');
    tbl.id = "theDataTable";
    tbl.innerHTML = "<tr><td id='thedataurl'>url</td><td id='thedata1_0'>oldest</td><td id='thedata2_0'>comments</td><td id='thedata3_0'>own</td><td id='thedata4_0'>last check</td><td id='thedata5_0'>new</td><td id='thedata6_0'>to me</td></tr>";

    var tr = document.createElement('tr');
    tr.innerHTML = "<tr><td><a></a></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";

    for (i = localStorage.length-1; i > localStorage.length-1-range; i--)
      {
      var url = localStorage.key(i);
      var data_to_insert = getcomment(url);
      if ((data_to_insert[2]===0) && scope===true)
        {
          continue;
        }
      line += 1;
      tbl.childNodes[0].appendChild(tr.cloneNode(true));
      var currenttr = tbl.childNodes[0].childNodes[line];
      currenttr.className = (data_to_insert[2]>0) ? "your-own" : "";
      currenttr.childNodes[0].id = "thedataurl"+ line;
      currenttr.childNodes[0].childNodes[0].textContent = url;
      currenttr.childNodes[0].childNodes[0].href = "https://hackaday.com/"+url;

      currenttr.childNodes[1].id = "thedata1_"+ line;
      currenttr.childNodes[1].textContent = printtime(data_to_insert[0]);

      currenttr.childNodes[2].id = "thedata2_"+ line;
      currenttr.childNodes[2].textContent = data_to_insert[1];

      currenttr.childNodes[3].id = "thedata3_"+ line;
      currenttr.childNodes[3].textContent = data_to_insert[2];

      currenttr.childNodes[4].id = "thedata4_"+ line;
      currenttr.childNodes[4].textContent = printtime(data_to_insert[3]);

      currenttr.childNodes[5].id = "thedata5_"+ line;
      currenttr.childNodes[5].textContent = data_to_insert[4];

      currenttr.childNodes[6].id = "thedata6_"+ line;
      currenttr.childNodes[6].textContent = data_to_insert[5];
      }

    tbl.onclick = function(e) {
      if (e.target && e.target.cellIndex == 4 && e.target.parentNode.rowIndex >0)
        {
          updaterow(e.target.parentNode.rowIndex);
        }
    };
//highlight row selected for update
    tbl.onmouseover = function(e) {
      if (e.target && e.target.cellIndex == 4 && e.target.parentNode.rowIndex >0)
        {
          e.target.parentNode.classList.add("your-selected");
        }
    };
    tbl.onmouseout = function(e) {
      if (e.target && e.target.cellIndex == 4 && e.target.parentNode.rowIndex >0)
        {
          e.target.parentNode.classList.remove("your-selected");
        }
    };

    document.getElementById("theData").appendChild(tbl);
  }

var end = new Date().getTime();
//console.log(end - start);
//alert(end - start);
}

function insidepost(hr, row, url) {
  var now = parseInt(Date.parse(Date())/10000);
//  responsecomments = hr.responseText.match("></span>[\r\n] +([0-9]+) Comments? +</a>") ? parseInt(hr.responseText.match("></span>[\r\n] +([0-9]+) Comments? +</a>")[1]) : 0;
  var div = document.createElement("div");
  div.innerHTML = hr.responseText;
  responsecomments = parseInt(div.getElementsByClassName("comments-counts")[0].textContent.replace(/[^0-9]/g, ""));
  commentdata=getcomment(url);
  setcomment(url, commentdata[0], commentdata[1], commentdata[2], now, responsecomments - commentdata[1], commentdata[5]);
//setcomment(url, latest_comment_date, number_of_comments_last_seen, did_I_comment, last_check, new_not_read, not_read_replies_to_me){

  document.getElementById("thedata4_"+row).innerHTML = "now";
  document.getElementById("thedata5_"+row).innerHTML = responsecomments - commentdata[1];

  return;

//alert( current_url+" "+comment_time_last+" "+list.length+" "+my_comments+" "+parseInt(Date.parse(Date())/10000));
//"url, comments last seen, all comments, my comments, check date, unread comments, unread replies to my comments"
//    setcomment(current_url, comment_time_last, list.length, my_comments, parseInt(Date.parse(Date())/10000), "0", "0");
}

function loadtheData() {
  var scope = document.getElementById("scope2").checked;
//  var hr = new XMLHttpRequest();
  var now = parseInt(Date.parse(Date())/10000);

//  var worker = new Worker('prime-worker.js');
  var script = "";
  script += "  self.onmessage = function(i, url) {";
  script += "    hr.open('GET', url, false);";
  script += "    hr.send(null);";
  script += "   self.postMessage(hr, i, url);";
  script += "  };";

  var dataURL = 'data:text/javascript;base64,' + btoa(script);
  var worker = unsafeWindow.Worker(dataURL);
  worker.onmessage = function(msg, i, url) {
    insidepost(msg, i, url);
    alert(msg);
    console.log(msg, i, url);
  };


  for (i = 1; i <= theDataTable.rows.length-1; i++)
  {
// only update ones I commented in if scope
    if (parseInt(document.getElementById("thedata3_"+i).innerText)===0 && scope===false)
     {
       continue;
     }
// only update older than 640x10 seconds
    if ((now - getcomment(document.getElementById("thedataurl"+i).innerText)[3]) < 640 )
     {
       continue;
     }
   url = document.getElementById("thedataurl"+i).innerText;
   worker.postMessage(i, url);
/*   hr.open("GET", url, false);
   hr.send(null);
   if(hr.readyState === 4 && hr.status === 200)
     {
       insidepost(hr, i, url);
     }
*/  }
}


function refactorData() {
  for(var blah in daata)
  {
    alert(daata[blah].split(' ')[0]);
     for (var i in stored.split(' '))
     {
       logit[i]=parseInt(stored.split(' ')[i]);
     }
  }
}


function getcomment(url){
  // alert( url);
  // getcomment = [latest_comment_date, number_of_comments_last_seen, did_I_comment, last_check, new_not_read, not_read_replies_to_me]
  var stored = localStorage.getItem(url);

  if (stored === null)
  {
    return [0, 0, 0, 0, 0, 0];
  }
  else if (stored.split(' ').length >2)
  {
    return stored.split(' ').map(Number);
  }
  else if (stored.split(' ').length ===1)
  {
    alert("wtf, corrupted data at: "+url); return [parseInt(stored), 0];
  }
  else if (stored.split(' ').length ===2)
  {
    return [parseInt(stored.split(' ')[0]), parseInt(stored.split(' ')[1]), 0, 0, 0, 0];
  }
}

// Using localStorage to store "URL" = "read date, comments last seen, my comments, check date, unread comments, unread replies to my comments" key/value pair
function setcomment(url, latest_comment_date, number_of_comments_last_seen, did_I_comment, last_check, new_not_read, not_read_replies_to_me){
   //alert(url +" "+ latest_comment_date +" "+ number_of_comments_last_seen +" "+ did_I_comment +" "+ last_check +" "+ new_not_read +" "+ not_read_replies_to_me);
  try
  {
    localStorage.setItem(url, latest_comment_date+" "+number_of_comments_last_seen+" "+did_I_comment+" "+last_check+" "+new_not_read+" "+not_read_replies_to_me);
  }
  catch (e)
  {
    if (e == QUOTA_EXCEEDED_ERR)
    {
      alert("Error: Local Storage limit exceeded.");
    }
    else
    {
      alert("Error: Saving to local storage.");
    }
  }
}


function getallcomments(url){
  // takes into account multiple comment pages
  // return latest_comment_date for current url
  // return number_of_comments_last_seen for all possible comment sub pages

  // we start with current page url
  var latest_comment_date = getcomment(url)[0];
  clean_url = url.match(/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/.*?\//)[0];
  var number_of_comments_last_seen = getcomment(clean_url)[1];
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

  return [latest_comment_date, number_of_comments_last_seen];
}
