
const songsAPI = "http://localhost:3000/songs"
fetch(songsAPI)
    .then(res => res.json())
    .then(data =>{
        
        const $ = document.querySelector.bind(document);
        const $$ = document.querySelectorAll.bind(document);

        const PLAYER_STORAGE_KEY = 'USER_PLAYER'

        const player = $('.player')
        const heading = $('header h2')
        const cdThumb = $('.cd-thumb')
        const audio = $('#audio')
        const playlist = $('.playlist')
        const cd = $('.cd')
        const progress = $('#progress')
        const playBtn = $('.btn-toggle-play')
        const prevBtn = $('.btn-prev')
        const nextBtn = $('.btn-next')
        const randomBtn = $('.btn-random')
        const repeatBtn= $('.btn-repeat')
        const startTime= $('.time-start')
        const finishTime= $('.time-finish')

        const app =  {
            currenIndex : 0,
            isPlaying : false,
            isRandom : false,
            isRepeat : false,
            config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
            
            songs : data,
            

            setConfig: function(key, value){
                this.config[key] = value;
                localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
            },  
            render: function(){
                const htmls = this.songs.map((song, index )=> {
                    return `
                        <div class="song ${index === this.currenIndex ? "active" : ""}" data-index=${index}>
                            <div class="thumb" style="background-image: url('${song.image}')"></div>
                            <div class="body">
                                <h3 class="title">${song.name}</h3>
                                <p class="author">${song.singer}</p>
                            </div>
                            <div class="option">
                                <i class="fas fa-ellipsis-h"></i>
                            </div>
                        </div>
                    `
                })
                playlist.innerHTML = htmls.join('')
            },

            defineProperties: function(){
                Object.defineProperty(this, 'currentSong',{
                    get: function(){
                        return this.songs[this.currenIndex];
                    }
                })
            },

            handleEvents: function(){
                const _this = this
                const cdWidth = cd.offsetWidth;

                // Xử lý cd xoay / dừng
                const cdThumdAnimate = cdThumb.animate([
                    {
                        transform: 'rotate(360deg)'
                    }
                ], {
                    duration: 10000, //10 seconds
                    iterations: Infinity,
                })
                
                cdThumdAnimate.pause();

                // Xử lý phóng to / thu nhỏ khi cuộn
                document.onscroll = function(){

                    document.onscroll = function(){
                        const scrollTop =window.scrollY || document.documentElement.scrollTop
                        const newCdWidth = cdWidth - scrollTop
                        cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
                        cd.style.opacity = newCdWidth / cdWidth;
                    }
                }

                // Xử lý khi bấm nút play
                playBtn.onclick = function(){
                    if(_this.isPlaying){
                        audio.pause();
                    }else{
                        audio.play();
                    }
                }
                // Khi bài hát được play
                audio.onplay = function(){
                    _this.isPlaying = true;
                    player.classList.add('playing')
                    cdThumdAnimate.play();
                }

                // Khi bài hát được pause
                audio.onpause = function(){
                    _this.isPlaying = false;
                    player.classList.remove('playing')
                    cdThumdAnimate.pause();
                }

                // Khi tiến độ bài hát thay đổi
                audio.ontimeupdate = function(){
                    if(audio.duration){
                        const progressPresent = Math.floor(audio.currentTime / audio.duration * 100)
                        progress.value = progressPresent
                    }
                }

                //Xử lý khi tua bài hát
                progress.onchange = function(e){
                    const seekTime = (e.target.value * audio.duration / 100);
                    audio.currentTime = seekTime
                } 

                // Xủ lý khi next bài hát
                nextBtn.onclick = function(){
                    if(_this.isRandom){
                        _this.playRandomSong();
                    }else{
                        _this.nextSong();
                    }
                    audio.play();
                    _this.render();
                    _this.scrollToActiveSong();
                }
                
                // Xủ lý khi prev bài hát
                prevBtn.onclick = function(){
                    if(_this.isRandom){
                        _this.playRandomSong();
                    }else{
                        _this.prevSong();
                    }
                    audio.play();
                    _this.render();           
                    _this.scrollToActiveSong();
                }

                // Xử lý khi audio ended
                audio.onended= function(){
                    if(_this.isRepeat){
                        audio.play();
                    }else{
                        nextBtn.click();
                    }
                }

                // Xử lý khi lặp lại một bài hát
                repeatBtn.onclick = function(e){
                    _this.isRepeat = !_this.isRepeat
                    _this.setConfig('isRepeat', _this.isRepeat)
                    repeatBtn.classList.toggle('active', _this.isRepeat);
                }

                // Xử lý khi random bật / tắt
                randomBtn.onclick = function(e){
                    _this.isRandom = !_this.isRandom
                    _this.setConfig('isRandom', _this.isRandom) 
                    randomBtn.classList.toggle('active',_this.isRandom);

                }

            // Lắng nghe hành vi click vào playlist
                playlist.onclick = function(e){
                    const songNode = e.target.closest('.song:not(.active)')
                    if(  songNode ||  e.target.closest('.option')){
                        // Xử lý khi click vào bài hát
                        if( songNode){
                            _this.currenIndex = Number(songNode.dataset.index)
                            _this.loadCurrentSong();
                            _this.render();
                            audio.play();
                        }

                        // Xử lý khi click vào option của bài hát
                        if( e.target.closest('.song:not(.active)')){

                        }

                    }
                }
            },

            loadConfig:function(){
                this.isRandom = this.config.isRandom
                this.isRepeat = this.config.isRepeat
            },

            loadCurrentSong: function(){
                heading.textContent = this.currentSong.name;
                cdThumb.style.background = `url('${this.currentSong.image}')`
                audio.src = this.currentSong.path
            },

            nextSong: function(){
                this.currenIndex ++
                if(this.currenIndex >= this.songs.length ){
                    this.currenIndex = 0
            }
                this.loadCurrentSong();
            },

            prevSong: function(){
            this.currenIndex --
            if(this.currenIndex < 0 ){
                    this.currenIndex = this.songs.length - 1;
            }
                this.loadCurrentSong();
            },

            playRandomSong: function(){
                let newIndex;
                do{
                    newIndex = Math.floor(Math.random() * this.songs.length)
                }while(newIndex === this.currenIndex )

                this.currenIndex = newIndex;
                this.loadCurrentSong();
            },

            scrollToActiveSong: function(){
                setTimeout(() =>{
                    $('.song.active').scrollIntoView({
                        behavior: 'smooth',
                        block: this.currenIndex <= 2 ? 'center' : 'nearest',
                    });
                },250)
            },


            start: function(){
                // Gán cầu hình từ config vào cấu hình
                this.loadConfig()

                // Định nghĩa các thuộc tính cho Object
                this.defineProperties()
                
                // Lắng nghe / Xử lí các sự kiện DOM event
                this.handleEvents()

                // Tải thông tin đầu tiên vào UI khi chạy ứng dụng
                this.loadCurrentSong();

                // Render ra playlist
                this.render()

                repeatBtn.classList.toggle('active', this.isRepeat);
                randomBtn.classList.toggle('active',this.isRandom);
            },
        }

        app.start();
    })



