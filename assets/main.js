
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

                // X??? l?? cd xoay / d???ng
                const cdThumdAnimate = cdThumb.animate([
                    {
                        transform: 'rotate(360deg)'
                    }
                ], {
                    duration: 10000, //10 seconds
                    iterations: Infinity,
                })
                
                cdThumdAnimate.pause();

                // X??? l?? ph??ng to / thu nh??? khi cu???n
                document.onscroll = function(){

                    document.onscroll = function(){
                        const scrollTop =window.scrollY || document.documentElement.scrollTop
                        const newCdWidth = cdWidth - scrollTop
                        cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
                        cd.style.opacity = newCdWidth / cdWidth;
                    }
                }

                // X??? l?? khi b???m n??t play
                playBtn.onclick = function(){
                    if(_this.isPlaying){
                        audio.pause();
                    }else{
                        audio.play();
                    }
                }
                // Khi b??i h??t ???????c play
                audio.onplay = function(){
                    _this.isPlaying = true;
                    player.classList.add('playing')
                    cdThumdAnimate.play();
                }

                // Khi b??i h??t ???????c pause
                audio.onpause = function(){
                    _this.isPlaying = false;
                    player.classList.remove('playing')
                    cdThumdAnimate.pause();
                }

                // Khi ti???n ????? b??i h??t thay ?????i
                audio.ontimeupdate = function(){
                    if(audio.duration){
                        const progressPresent = Math.floor(audio.currentTime / audio.duration * 100)
                        progress.value = progressPresent
                    }
                }

                //X??? l?? khi tua b??i h??t
                progress.onchange = function(e){
                    const seekTime = (e.target.value * audio.duration / 100);
                    audio.currentTime = seekTime
                } 

                // X??? l?? khi next b??i h??t
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
                
                // X??? l?? khi prev b??i h??t
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

                // X??? l?? khi audio ended
                audio.onended= function(){
                    if(_this.isRepeat){
                        audio.play();
                    }else{
                        nextBtn.click();
                    }
                }

                // X??? l?? khi l???p l???i m???t b??i h??t
                repeatBtn.onclick = function(e){
                    _this.isRepeat = !_this.isRepeat
                    _this.setConfig('isRepeat', _this.isRepeat)
                    repeatBtn.classList.toggle('active', _this.isRepeat);
                }

                // X??? l?? khi random b???t / t???t
                randomBtn.onclick = function(e){
                    _this.isRandom = !_this.isRandom
                    _this.setConfig('isRandom', _this.isRandom) 
                    randomBtn.classList.toggle('active',_this.isRandom);

                }

            // L???ng nghe h??nh vi click v??o playlist
                playlist.onclick = function(e){
                    const songNode = e.target.closest('.song:not(.active)')
                    if(  songNode ||  e.target.closest('.option')){
                        // X??? l?? khi click v??o b??i h??t
                        if( songNode){
                            _this.currenIndex = Number(songNode.dataset.index)
                            _this.loadCurrentSong();
                            _this.render();
                            audio.play();
                        }

                        // X??? l?? khi click v??o option c???a b??i h??t
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
                // G??n c???u h??nh t??? config v??o c???u h??nh
                this.loadConfig()

                // ?????nh ngh??a c??c thu???c t??nh cho Object
                this.defineProperties()
                
                // L???ng nghe / X??? l?? c??c s??? ki???n DOM event
                this.handleEvents()

                // T???i th??ng tin ?????u ti??n v??o UI khi ch???y ???ng d???ng
                this.loadCurrentSong();

                // Render ra playlist
                this.render()

                repeatBtn.classList.toggle('active', this.isRepeat);
                randomBtn.classList.toggle('active',this.isRandom);
            },
        }

        app.start();
    })



