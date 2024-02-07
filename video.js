// Define constants
const API_KEY = "AIzaSyAY3_SSL5HVtwFl5K_M3qCnH1k3leRfuWs";
const BASE_URL = "https://www.googleapis.com/youtube/v3";

// DOM elements
const toggleSidebarBtn = document.getElementById("toggle_btn");
const sidebarToggleMenu = document.getElementById("sidebar_toggle_menu");

// Event listeners
window.addEventListener("load", initialize);

// Initialize function
async function initialize() {
  const videoId = getVideoIdFromURL();
  if (videoId) {
    try {
      await loadVideo(videoId);
      await loadComments(videoId);
      await loadVideoDetails(videoId);
    } catch (error) {
      console.error("Error loading video details:", error);
    }
  } else {
    console.error("No video ID found in URL");
  }
}

// Load video function
async function loadVideo(videoId) {
  if (typeof YT !== "undefined") {
    new YT.Player("video-container", {
      height: "500",
      width: "1000",
      videoId: videoId,
    });
  }
}

// Load video details function
async function loadVideoDetails(videoId) {
  try {
    const response = await fetch(
      `${BASE_URL}/videos?key=${API_KEY}&part=snippet&id=${videoId}`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch video details. Status: ${response.status}`
      );
    }
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const videoDetails = data.items[0].snippet;
      displayVideoDetails(videoDetails);
      await loadChannelInfo(videoDetails.channelId);
    }
  } catch (error) {
    console.error("Error fetching video details: ", error);
  }
}

// Load channel information function
async function loadChannelInfo(channelId) {
  try {
    const response = await fetch(
      `${BASE_URL}/channels?key=${API_KEY}&part=snippet&id=${channelId}`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch channel info. Status: ${response.status}`
      );
    }
    const data = await response.json();
    if (data.items) {
      const channelData = data.items[0];
      displayChannelInfo(channelData);
      await loadRecommendedVideos(channelData.snippet.title);
    }
  } catch (error) {
    console.error("Error fetching channel info: ", error);
  }
}

// Load comments function
async function loadComments(videoId) {
  try {
    const response = await fetch(
      `${BASE_URL}/commentThreads?key=${API_KEY}&videoId=${videoId}&maxResults=25&part=snippet`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch comments. Status: ${response.status}`);
    }
    const data = await response.json();
    if (data.items) {
      displayComments(data.items);
    } else {
      console.log("No comments available or data is undefined.");
    }
  } catch (error) {
    console.error("Error fetching comments: ", error);
  }
}

// Display video details
function displayVideoDetails(videoDetails) {
  document.getElementById("video-title").innerText = videoDetails.title;
}

// Display channel information
function displayChannelInfo(channelData) {
  const channelInfoSection = document.getElementById("channel-info");
  channelInfoSection.innerHTML = `
        <a href="channel.html?channelId=${channelData.id}">
          <img src="${channelData.snippet.thumbnails.default.url}" alt="">
          <div>
              <h4>${channelData.snippet.title}</h4>
              <p>1.8M subscribers</p>
          </div>
        </a>
        <button class="sub-btn" >SUBSCRIBE</button>
    `;
}

// Display comments
function displayComments(comments) {
  const commentSection = document.getElementById("comment-section");
  commentSection.innerHTML = "<h3>Comments</h3>";

  comments.forEach((comment) => {
    commentSection.innerHTML += `<p>${comment.snippet.topLevelComment.snippet.textDisplay}</p>`;
  });
}

// Load recommended videos
async function loadRecommendedVideos(channelName) {
  try {
    const response = await fetch(
      `${BASE_URL}/search?key=${API_KEY}&maxResults=25&part=snippet&q=${channelName}`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch recommended videos. Status: ${response.status}`
      );
    }
    const data = await response.json();
    if (data.items) {
      displayRecommendedVideos(data.items);
    } else {
      console.log("No recommended videos available or data is undefined.");
    }
  } catch (error) {
    console.error("Error fetching recommended videos: ", error);
  }
}

// Display recommended videos
function displayRecommendedVideos(videos) {
  const recommendedSection = document.getElementById("recommended-videos");
  recommendedSection.innerHTML = "";

  videos.forEach(async (video) => {
    const { id, snippet } = video;
    const { videoId } = id;
    const { title, thumbnails, channelTitle, publishedAt } = snippet;
    const views = await getVideoStats(videoId);
    const formattedViews = formatNumber(views);
    const timeInfo = getTimeInfo(publishedAt);

    const videoCard = document.createElement("div");
    videoCard.className = "videoCard";
    videoCard.innerHTML = `
            <a href="video.html?videoId=${videoId}">
                <div class="img_container">
                    <img class="thumbnail" src="${
                      thumbnails.medium.url
                    }" alt="${title}">
                </div>
                <div>
                    <p style="font-size:0.8rem">${title}</p>
                    <p class="channelName">${channelTitle}</p>
                    <p class="channelName">${
                      formattedViews || 0
                    } views . ${timeInfo} ago</p>
                </div> 
            </a>
        `;
    recommendedSection.appendChild(videoCard);
  });
}

// Fetch video statistics
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

// Format number function
function formatNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num;
}

// Get time info function
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

// Helper function to get video ID from URL
function getVideoIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("videoId");
}

// Sidebar toggle button event listener
toggleSidebarBtn.addEventListener("click", toggleSidebar);

// Function to toggle sidebar
function toggleSidebar() {
  const popup = document.getElementById("popup");
  if (popup.style.display === "none") {
    popup.style.display = "block";
    sidebarToggleMenu.insertBefore(youtubeIcon, homeSection);
  } else {
    popup.style.display = "none";
    navbar.insertBefore(youtubeIcon, searchSection);
  }
}

// Form submission event listener
const searchForm = document.getElementById("search_form");
searchForm.addEventListener("submit", handleSearchSubmit);

// Function to handle search form submission
function handleSearchSubmit(event) {
  event.preventDefault();
  const searchQuery = document.getElementById("search_input").value.trim();
  if (searchQuery) {
    window.location = `index.html?searchQuery=${searchQuery
      .split(" ")
      .join("+")}`;
  }
}
