const redrawPost = (postId, callback) => {
  fetch(`/api/posts/${postId}`)
    .then((response) => response.json())
    .then((updatedPost) => {
      if(!callback){
        redrawCard(updatedPost);
      }else {
        callback(updatedPost);
      }
    });
};

const redrawCard = post => {
  console.log(post);
  const html = post2Html(post);
  const newElement = html2Element(html);
  const postElement = document.querySelector(`#post_${post.id}`);
  console.log(postElement);
  postElement.replaceWith(newElement);
  // const newElement = stringToHTML(html);
  // const postElement = document.querySelector(`#post_${post.id}`);
  // postElement.innerHTML = newElement.innerHTML;
}

const html2Element = (html) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.firstElementChild;
};

const handleLike = (ev) => {
  const elem = ev.currentTarget;
  const likeId = elem.dataset.likeId;
  const liked = likeId != "";
  if (!liked) {
    console.log("like post");
    likePost(elem);
  } else {
    console.log("unlike post");
    unlikePost(elem);
  }
};

const renderLikeButton = (post) => {
  return `
    <button
      data-post-id="${post.id}"
      data-like-id="${post.current_user_like_id || ""}"
      aria-label="like/unlike"
      aria-checked="${post.current_user_like_id ? "true" : "false"}"
      onclick="handleLike(event);">
      <i class="${
        post.current_user_like_id ? "fas" : "far"
      } fa-heart fa-2x"></i>
    </button>
    `;
};

const unlikePost = (elem) => {
  postId = Number(elem.dataset.postId);
  const deleteURL = `/api/posts/likes/${elem.dataset.likeId}`;
  fetch(deleteURL, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      'X-CSRF-TOKEN': getCookie('csrf_access_token')
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      redrawPost(postId);
    });
};

const likePost = (elem) => {
  const postId = Number(elem.dataset.postId);
  const postData = {
    post_id: postId,
  };

  fetch("/api/posts/likes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'X-CSRF-TOKEN': getCookie('csrf_access_token')
    },
    body: JSON.stringify(postData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      redrawPost(postId);
    });
};

const handleBookmark = (ev) => {
  const elem = ev.currentTarget;
  const bookmarkId = elem.dataset.bookmarkId;
  const bookmarked = bookmarkId != "";
  if (!bookmarked) {
    console.log("bookmark post");
    bookmarkPost(elem);
  } else {
    console.log("unbookmark post");
    unbookmarkPost(elem);
  }
};

const renderBookmarkButton = (post) => {
  return `
    <button
      data-post-id="${post.id}"
      data-bookmark-id="${post.current_user_bookmark_id || ""}"
      aria-label="bookmark/unbookmark"
      aria-checked="${post.current_user_bookmark_id ? "true" : "false"}"
      onclick="handleBookmark(event);">
      <i class="${
        post.current_user_bookmark_id ? "fas" : "far"
      } fa-bookmark fa-2x bookmark-icon"></i>
    </button>
    `;
};

const unbookmarkPost = (elem) => {
  postId = Number(elem.dataset.postId);
  const deleteURL = `/api/bookmarks/${elem.dataset.bookmarkId}`;
  fetch(deleteURL, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      'X-CSRF-TOKEN': getCookie('csrf_access_token')
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      redrawPost(postId);
    });
};

const bookmarkPost = (elem) => {
  const postId = Number(elem.dataset.postId);
  const postData = {
    post_id: postId,
  };
  fetch("/api/bookmarks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'X-CSRF-TOKEN': getCookie('csrf_access_token')
    },
    body: JSON.stringify(postData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      redrawPost(postId);
    });
};

const displayComments = (post) => {
  if (post.comments.length > 1) {
    return `<button data-post-id=${post.id} id="viewAll_${post.id}" onclick="showModal(event)" class="blue-text">View all ${
      post.comments.length
    } Comments</button>
            <p>
              <b>${post.comments[post.comments.length - 1].user.username}</b> ${
      post.comments[post.comments.length - 1].text
    }
            </p>`;
  } else if (post.comments.length === 1) {
    return `<p>
              <b>${post.comments[0].user.username}</b>${post.comments[0].text}
            </p>`;
  } else {
    return "";
  }
};

const addComment = (ev) => {
  console.log("Add Comment");
  // console.log(document.querySelector(".comment-input"));
  console.log(ev.target.value)
  const postId = Number(ev.currentTarget.dataset.postId);
  const postData = {
    post_id: postId,
    text: document.querySelector(`#input_${postId}`).value,
  };
  console.log(postData)
  fetch("/api/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      redrawPost(postId);
    });
};


const modalComments = comment => {
  return `<p><b>${comment.user.username}</b> ${comment.text}</p>`
}


const post2Modal = (post) => {
  return `<div class="modal-bg" aria-hidden="false" role="dialog">
            <section class="modal">
                <button id="close" data-post-id="${post.id}" aria-label="Close the modal window" onclick="closeModal(event);">Close</button>
                <div class="modal-body modal-content">
                  <img style="width:50%" src="${post.image_url}"/>
                  <div class="modal-comments">
                    ${post.comments.map(modalComments).join("\n")}
                  </div>
                </div>
            </section>
          </div>`;
};

const showModal = ev => {
  console.log("show modal")
  const postId = Number(ev.currentTarget.dataset.postId);
  console.log(postId);
  // fetch(`/api/posts/${postId}`)
  //   .then(response => response.json())
  //   .then(post => {
  //     const html = post2Modal(post);
  //     document
  //       .querySelector(`#post_${post.id}`)
  //       .insertAdjacentHTML(`beforeend`, html);
  //   });
  redrawPost(postId, post => {
    const html = post2Modal(post);
    document
      .querySelector(`#post_${post.id}`)
      .insertAdjacentHTML(`beforeend`, html);
    document.getElementById('close').focus();
  });
};

const closeModal = (ev) => {
  console.log(ev.target)
  const postId = Number(ev.currentTarget.dataset.postId);
  console.log("close modal");
  console.log(postId);
  document.querySelector('.modal-bg').remove();
  console.log(document.querySelector(`#viewAll_${postId}`))
  document.querySelector(`#viewAll_${postId}`).focus();
};

const post2Html = (post) => {
  console.log(post.current_user_like_id);
  return `<div id="post_${post.id}" class="card">
          <!-- Posts rendered client-side -->
          <div class="header">
              <h2 class="card-name">${post.user.username}</h2>
              <!-- <i class="fa-solid fa-ellipsis dots-img fa-2x"></i> -->
          </div>
          <img
            class="img"
            src=${post.image_url}
            alt="post image"
          />
          <div class="icons">
            ${renderLikeButton(post)}
            <button>
                <i class="far fa-comment icon-img fa-2x"></i>
            </button>
            <button>
                <i class="far fa-share-square icon-img fa-2x"></i>
            </button>
            ${renderBookmarkButton(post)}
          </div>
          
          <p class="likes card-text">
            <b>${post.likes.length} likes</b>
          </p>
          <div class="caption card-text">
            <p>
                <b>${post.user.username}</b> ${post.caption}
                <a href="/" class="blue-text" style="text-decoration: none">more</a>
            </p>
          </div>
          <div class="comments card-text">
            ${displayComments(post)}
          </div>
          <div class="timestamp">
            <p>${post.display_time}</p>
          </div>
          <hr/>
          <div class="comment-sec">
              <i class="far fa-smile emoji-img fa-2x"></i>
              <input type="text" class="comment-input" id="input_${post.id}" onchange="inputChange(event)" placeholder="Add a Comment"/>
              <button data-post-id="${post.id}" class="post-button blue-text" onclick="addComment(event)">Post</button>
          </div>
      </div>`;
};

const getPosts = () => {
  fetch("/api/posts/")
    .then((response) => response.json())
    .then((post) => {
      console.log(post);
      const html = post.map(post2Html).join("\n");
      document.querySelector(".card-container").innerHTML = html;
    });
};

const toggleFollow = (ev) => {
  console.log(ev);
  const elem = ev.currentTarget;
  console.log(elem.dataset);
  console.log(elem.dataset.userId);
  console.log(elem.innerHTML);
  if (elem.innerHTML === "follow") {
    followUser(elem.dataset.userId, elem);
  } else {
    unfollowUser(elem.dataset.followingId, elem);
  }
};

const followUser = (userId, elem) => {
  const postData = {
    user_id: userId,
  };

  fetch("/api/following/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      elem.innerHTML = "unfollow";
      elem.setAttribute("aria-checked", "true");
      elem.classList.add("unfollow");
      elem.classList.remove("follow");
      // in the event that we want to unfollow the user with the userid
      elem.setAttribute("data-following-id", data.id);
    });
};

const unfollowUser = (followingId, elem) => {
  const deleteURL = `/api/following/${followingId}`;
  fetch(deleteURL, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      elem.innerHTML = "follow";
      elem.classList.add("follow");
      elem.classList.remove("unfollow");
      elem.removeAttribute("data-following-id");
      elem.setAttribute("aria-checked", "false");
    });
};

const profile2Html = (profile) => {
  return `<div class="profile">
            <div class="pic-name">
              <img
                src=${profile.image_url}
                class="profile-pic"
                alt="picture of nature"
              />
              <b class="profile-name">${profile.username}</b>
            </div>
            <p class="profile-text">Suggestions for you<p>
          </div>
          `;
};

const getProfile = () => {
  fetch("/api/profile/")
    .then((response) => response.json())
    .then((profile) => {
      console.log(profile);
      const html = profile2Html(profile);
      document.querySelector("header").innerHTML = html;
    });
};

const user2Html = (user) => {
  return `<div class="suggestion">
          <img src="${user.thumb_url}" />
          <div>
              <p class="username">${user.username}</p>
              <p class="suggestion-text">suggested for you</p>
          </div>
          <div>
              <button 
                  class="follow" 
                  aria-label="Follow"
                  aria-checked="false"
                  data-user-id="${user.id}" 
                  onclick="toggleFollow(event);">follow</button>
          </div>
      </div>`;
};

const getSuggestions = () => {
  fetch("/api/suggestions/")
    .then((response) => response.json())
    .then((users) => {
      console.log(users);
      const html = users.map(user2Html).join("\n");
      document.querySelector(".suggestions").innerHTML = html;
    });
};

const story2Html = (story) => {
  return `
          <div>
              <img src="${story.user.thumb_url}" class="pic" alt="profile pic for ${story.user.username}" />
              <p>${story.user.username}</p>
          </div>
      `;
};

// fetch data from your API endpoint:
const displayStories = () => {
  fetch("/api/stories")
    .then((response) => response.json())
    .then((stories) => {
      const html = stories.map(story2Html).join("\n");
      document.querySelector(".stories").innerHTML = html;
    });
};

const getCookie = key => {
  let name = key + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  console.log(decodedCookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
      console.log(c);
      if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
      }
  }
  return "";
};

const initPage = () => {
  displayStories();
  getPosts();
  getSuggestions();
  getProfile();
};

// invoke init page to display stories:
initPage();