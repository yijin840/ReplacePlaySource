// ==UserScript==
// @name         替换某站源
// @namespace    https://github.com/yijin840/ReplacePlaySource
// @version      0.1
// @description  通过本地或者在线视频替换播放视频
// @author       cure_dovahkiin
// @match        https://www.bilibili.com/*
// @icon         https://www.bilibili.com/favicon.ico?v=1
// @license MIT
// ==/UserScript==

(function () {
    "use strict";
    var newVideo;
    function insertBtn() {
        let localBtn = document.createElement("div");
        localBtn.className = "watch-info ops replace_video_source";
        localBtn.innerHTML = `<a>本地源  </a>`;
        localBtn.onclick = function () {
            let picker = document.createElement("input");
            picker.type = "file";
            picker.onchange = function (ev) {
                const file = ev.target.files?.[0];
                if (!file) return;
                let url = URL.createObjectURL(file);
                replaceResouce(url);
            };
            document.body.append(picker);
            picker.click();
        };

        let onlineBtn = document.createElement("div");
        onlineBtn.className = "watch-info ops";
        onlineBtn.innerHTML = `<a>在线源</a>`;
        onlineBtn.onclick = function () {
            let url = prompt("输入在线源,确保可播放");
            replaceResouce(url);
        };

        const bar = document.querySelector("#toolbar_module,#arc_toolbar_report");
        bar && bar.append(localBtn);
        bar && bar.append(onlineBtn);
    }

    function replaceResouce(url) {
        //获取原来的视频bwp播放器
        const vdo = document.querySelector(".bpx-player-video-wrap bwp-video");
        //创建新的播放器
        newVideo = document.createElement("video");
        newVideo.id = "customVideoElement";
        newVideo.src = url;
        newVideo.controls = false;
        newVideo.width = vdo.clientWidth;
        newVideo.height = vdo.clientHeight;
        //隐藏旧的播放器
        vdo.parentNode.insertBefore(newVideo, vdo);
        vdo.style.display = "none";

        bind();
    }

    function bind() {
        auditBind();
        playPauseBind();
        progressBind();
        bufferBind();
    }

    /**
     * 音频控制绑定
     */
    function auditBind() {
        // 获取的音量滑块元素
        const videoVolumeBar = document.querySelector('.bui-bar.bui-bar-normal');
        const videoVolumeThumb = document.querySelector('.bui-thumb');

        // 创建一个函数来同步音量
        function syncVolume() {
            // 获取音量滑块的当前值
            const volumeScale = parseFloat(videoVolumeBar.style.transform.match(/scaleY\(([^)]+)\)/)[1]);

            // 将音量值设置到你的视频上
            newVideo.volume = volumeScale;
        }

        // 监听音量滑块的变化
        const observer = new MutationObserver(syncVolume);
        observer.observe(videoVolumeThumb, { attributes: true, attributeFilter: ['style'] });
    }

    /**
     * 播放暂停绑定
     */
    function playPauseBind() {
        const playPauseBtn = document.querySelector(".bpx-player-ctrl-btn-icon");
        if (playPauseBtn) {
            playPauseBtn.addEventListener("click", function () {
                if (newVideo.paused) {
                    newVideo.play();
                } else {
                    newVideo.pause();
                }
            });
        }

        newVideo.addEventListener("click", function () {
            if (newVideo.paused) {
                newVideo.play();
            } else {
                newVideo.pause();
            }
        });
    }

    /**
     * 进度条绑定
     */
    function progressBind() {
        const videoProgressBarWrap = document.querySelector('.bpx-player-progress-schedule-wrap');
        const progressBarChildren = videoProgressBarWrap.querySelectorAll('*');
        progressBarChildren.forEach(child => {
            child.addEventListener('click', function (event) {
                event.stopPropagation();
            });
        });
        // 为进度条容器添加点击事件监听器
        videoProgressBarWrap.addEventListener('click', function (event) {
            // 计算点击位置相对于进度条长度的百分比
            const rect = videoProgressBarWrap.getBoundingClientRect();
            const clickPosition = event.clientX - rect.left;
            const progressPercentage = clickPosition / rect.width;

            // 设置视频的currentTime属性
            newVideo.currentTime = progressPercentage * newVideo.duration;
        });
        videoProgressBarWrap.addEventListener('click', function (event) {
            const rect = videoProgressBarWrap.getBoundingClientRect();
            const clickPosition = event.clientX - rect.left;
            const progressPercentage = clickPosition / rect.width;
            newVideo.currentTime = progressPercentage * newVideo.duration;
        });
    }


    function init() {
        insertBtn();
        setTimeout(() => {
            let target = document.querySelector(".replace_video_source");
            if (!target) {
                init();
            }
        }, 2000);
    }

    setTimeout(() => {
        init();
    }, 2000);
})();
