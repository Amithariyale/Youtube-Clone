const API_KEY = "";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

const toggleSidebarBtn = document.getElementById("toggle_btn");
const sidebarMenu = document.getElementById("sidebar_menu");
const sidebarToggleMenu = document.getElementById("sidebar_toggle_menu");

window.addEventListener("load", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get("videoId");

  if (videoId) {
    loadVideo(videoId);
    loadComments(videoId);
    loadVideoDetails(videoId);
  } else {
    console.error("No video ID found in URL");
  }
});

function loadVideo(videoId) {
  if (YT) {
    new YT.Player("video-container", {
      height: "500",
      width: "1000",
      videoId: videoId,
    });
  }
}

async function loadVideoDetails(videoId) {
  try {
    const response = await fetch(
      `${BASE_URL}/videos?key=${API_KEY}&part=snippet&id=${videoId}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const channelId = data.items[0].snippet.channelId;
      loadChannelInfo(channelId);
    }
  } catch (error) {
    console.error("Error fetching video details: ", error);
  }
}

async function loadChannelInfo(channelId) {
  try {
    const response = await fetch(
      `${BASE_URL}/channels?key=${API_KEY}&part=snippet&id=${channelId}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.items) {
      displayChannelInfo(data.items[0]);
      loadRecommendedVideos(data.items[0].snippet.title);
    }
  } catch (error) {
    console.error("Error fetching channel info: ", error);
  }
}

function displayChannelInfo(channelData) {
  const channelInfoSection = document.getElementById("channel-info");
  channelInfoSection.innerHTML = `
        <h3>${channelData.snippet.title}</h3>
        <img src="${channelData.snippet.thumbnails.default.url}" alt="${channelData.snippet.title}">
        <p>${channelData.snippet.description}</p>
    `;
}

async function loadComments(videoId) {
  try {
    const response = await fetch(
      `${BASE_URL}/commentThreads?key=${API_KEY}&videoId=${videoId}&maxResults=25&part=snippet`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("comments", data);
    if (data.items) {
      displayComments(data.items);
    } else {
      console.log("No comments available or data is undefined.");
    }
  } catch (error) {
    console.error("Error fetching comments: ", error);
  }
}

function displayComments(comments) {
  const commentSection = document.getElementById("comment-section");
  commentSection.innerHTML = "";

  comments.forEach((comment) => {
    const commentText = comment.snippet.topLevelComment.snippet.textDisplay;
    const commentElement = document.createElement("p");
    commentElement.innerHTML = commentText;
    commentSection.appendChild(commentElement);
  });
}

async function loadRecommendedVideos(channelName) {
  try {
    const response = await fetch(
      `${BASE_URL}/search?key=${API_KEY}&maxResults=25&part=snippet&q=${channelName}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Recommended videos", data);
    if (data.items) {
      displayRecommendedVideos(data.items);
    } else {
      console.log("No recommended videos available or data is undefined.");
    }
  } catch (error) {
    console.error("Error fetching recommended videos: ", error);
  }
}

async function getVideoStats(videoId) {
  try {
    const response = await fetch(
      `${BASE_URL}/videos?key=${API_KEY}&part=statistics&id=${videoId}`
    );
    const data = await response.json();
    return data.items[0].statistics.viewCount;
  } catch (error) {
    console.error("Error fetching video stats:", error);
  }
}

function displayRecommendedVideos(videos) {
  const recommendedSection = document.getElementById("recommended-videos");
  recommendedSection.innerHTML = "";

  videos.forEach(async (video) => {
    const videoId = video.id.videoId;
    const title = video.snippet.title;
    const thumbnail = video.snippet.thumbnails.medium.url;
    const channelName = video.snippet.channelTitle;
    const views = await getVideoStats(video.id.videoId);

    const videoCard = document.createElement("div");
    videoCard.className = "videoCard";
    videoCard.innerHTML = `
            <a  href="video.html?videoId=${videoId}">
                <div class="img_container">
                    <img class="thumbnail" src="${thumbnail}" alt="${title}">
                </div>
                <div>
                    <p style="font-size:0.8rem">${title}</p>
                    <p class="channelName">${channelName}</p>
                    <p class="channelName">${
                      formatNumber(views) || 0
                    } views . ${getTimeInfo(video.snippet.publishedAt)} ago</p>
                </div> 
            </a>
        `;
    recommendedSection.appendChild(videoCard);
  });
}

function formatNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num;
}

function getTimeInfo(publishAt) {
  const currentTime = Date.now();
  const publishTime = new Date(publishAt).getTime();
  const timeDifference = currentTime - publishTime;

  const seconds = Math.floor(timeDifference / 1000);
  if (seconds < 60) return seconds + (seconds === 1 ? " second" : " seconds");

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + (minutes === 1 ? " minute" : " minutes");

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + (hours === 1 ? " hour" : " hours");

  const days = Math.floor(hours / 24);
  if (days < 7) return days + (days === 1 ? " day" : " days");

  const weeks = Math.floor(days / 7);
  if (weeks < 52) return weeks + (weeks === 1 ? " week" : " weeks");

  const years = Math.floor(weeks / 52);
  return years + (years === 1 ? " year" : " years");
}

toggleSidebarBtn.addEventListener("click", () => {
  sidebarMenu.style.display =
    sidebarMenu.style.display === "none" ? "block" : "none";
  sidebarToggleMenu.style.display =
    sidebarToggleMenu.style.display === "none" ? "block" : "none";
});

const searchForm = document.getElementById("search_form");
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  window.location="index.html"
  const searchQuery = document.getElementById("search_input").value.trim();
  if (searchQuery) {
    fetchVideos(searchQuery.split(" ").join("+"));
  }
});
