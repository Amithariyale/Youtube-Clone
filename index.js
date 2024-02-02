const BASE_URL = "https://www.googleapis.com/youtube/v3";
const API_KEY = "";

const videoContainer = document.getElementById("video_container");
const searchForm = document.getElementById("search_form");
const toggleSidebarBtn = document.getElementById("toggle_btn");
const sidebarMenu = document.getElementById("sidebar_menu");
const sidebarToggleMenu = document.getElementById("sidebar_toggle_menu");

document.addEventListener("DOMContentLoaded", initialize);

function initialize() {
  const extractedData = JSON.parse(localStorage.getItem("data"));
  if (extractedData) {
    showVideos(extractedData);
  } else {
    fetchVideos("science");
  }
}

async function fetchVideos(searchQuery) {
  try {
    const response = await fetch(
      `${BASE_URL}/search?key=${API_KEY}&q=${searchQuery}&part=snippet&type=video&maxResults=100`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch videos");
    }
    const data = await response.json();
    localStorage.setItem("data", JSON.stringify(data.items));
    showVideos(data.items);
  } catch (error) {
    console.error("Error fetching videos:", error);
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

async function getChannelLogo(channelId) {
  try {
    const response = await fetch(
      `${BASE_URL}/channels?key=${API_KEY}&id=${channelId}&part=snippet&maxResult=20`
    );
    const data = await response.json();
    return data.items[0].snippet.thumbnails.default.url;
  } catch (error) {
    console.error("Error fetching channel logo:", error);
  }
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

function showVideos(videos) {
  videoContainer.innerHTML = "";
  videos.forEach(async (video) => {
    try {
      const channelLogo = await getChannelLogo(video.snippet.channelId);
      const views = await getVideoStats(video.id.videoId);

      videoContainer.innerHTML += `
                <div class="videoCard">
                    <a href="video.html?videoId=${video.id.videoId}">
                        <div class="img_container">
                            <img class="thumbnail" src="${
                              video.snippet.thumbnails.high.url
                            }">
                        </div>
                        <div class="video_details">
                            <img class="logo" src="${channelLogo}">
                            <div>
                                <p>${video.snippet.title}</p>
                                <p class="channel">${
                                  video.snippet.channelTitle
                                }</p>
                                <p class="views">${formatNumber(
                                  views
                                )} views . ${getTimeInfo(
        video.snippet.publishedAt
      )} ago</p>
                            </div>
                        </div>
                    </a>
                </div>`;
    } catch (error) {
      console.error("Error displaying video:", error);
    }
  });
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchQuery = document.getElementById("search_input").value.trim();
  if (searchQuery) {
    fetchVideos(searchQuery.split(" ").join("+"));
  }
});

toggleSidebarBtn.addEventListener("click", () => {
  sidebarMenu.style.display =
    sidebarMenu.style.display === "none" ? "block" : "none";
  sidebarToggleMenu.style.display =
    sidebarToggleMenu.style.display === "none" ? "block" : "none";
});
