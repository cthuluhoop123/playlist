import React, { Component } from 'react'
import request from 'superagent'
import { Input, Button, Spin } from 'antd'
import { Link } from 'react-router-dom'
import ReactAplayer from 'react-aplayer'

import '../Css/Home.css'
import 'antd/dist/antd.css'

const youtubeIDRegex = [/(?:https?:\/\/www\.youtube\.com\/watch\?v=)(.+)/g, /(?:https?:\/\/youtu.be\/)(.+)/g]

class Home extends Component {
    constructor() {
        super()
        this.addSong = this.addSong.bind(this)
        this.handleSongInput = this.handleSongInput.bind(this)
        this.childSetState = this.childSetState.bind(this)
        this.initAPlayer = this.initAPlayer.bind(this)
        this.addSongWaitList = []
        this.state = {
            playlist: [],
            currentSong: 0,
            play: false,
            songInput: '',
            error: undefined,
            loading: false
        }
    }

    componentDidMount() {
        this.setState({
            playlist: localStorage.getItem('playlist') ? JSON.parse(localStorage.getItem('playlist')) : []
        })
    }

    componentWillUnmount() {
        if (!this.player) { return }
        this.player.destroy()
    }

    childSetState(state, callback) {
        this.setState(state, callback)
    }

    async addSong() {
        this.refs.songSearch.input.value = ''
        let songID = this.state.songInput
        youtubeIDRegex.map(regex => {
            songID = songID.replace(regex, '$1')
        })
        if (!this.state.songInput || this.addSongWaitList.includes(songID) || this.state.playlist.map(song => song.videoID).includes(songID)) { return }
        try {
            this.addSongWaitList.push(songID)
            this.setState({
                error: undefined,
                loading: true
            })
            const { body: songInfo } = await request.get(`${process.env.REACT_APP_API}/info/${songID}`)

            this.setState({
                playlist: this.state.playlist.concat(songInfo)
            }, () => {
                localStorage.setItem('playlist', JSON.stringify(this.state.playlist))
                let videoIDList = this.state.playlist.map(song => song.videoID)
                if (videoIDList.length > 1) {
                    this.player.list.add({
                        name: songInfo.title,
                        artist: songInfo.author.name,
                        url: `${process.env.REACT_APP_API}/listen/${songInfo.videoID}`,
                        cover: songInfo.author.avatar,
                        theme: '#009fff'
                    })
                }
                this.addSongWaitList = this.addSongWaitList.filter(song => {
                    return song !== songID
                })
            })
        } catch (e) {
            this.setState({
                error: `Couldn't add the song. Are you sure this is a valid Youtube URL/ID?`
            })
        } finally {
            this.setState({
                loading: false
            })
        }
    }

    handleSongInput(e) {
        this.setState({
            songInput: e.target.value
        })
    }

    initAPlayer(player) {
        player.audio.preload = false
        this.player = player
    }

    render() {
        const audioList = this.state.playlist.map(song => {
            return {
                name: song.title,
                artist: song.author.name,
                url: `${process.env.REACT_APP_API}/listen/${song.videoID}`,
                cover: song.author.avatar,
                theme: '#009fff'
            }
        })
        return (
            <div className='content'>
                <h1>the boring playlist</h1>
                <div className='playList'>
                    <Input
                        ref='songSearch'
                        className='search'
                        onChange={this.handleSongInput}
                        onPressEnter={this.addSong}
                        placeholder='Youtube URL or ID'
                    />
                    <Button className='addSong' onClick={this.addSong}>Add</Button>
                    {
                        this.state.loading
                            ? <div className='loader'><Spin className='loader' /></div>
                            : undefined
                    }
                    {
                        this.state.error
                            ? <p className='error'>{this.state.error}</p>
                            : undefined
                    }
                    <div className='queue'>
                        {
                            this.state.playlist.length > 0
                                ?
                                <div className='center'>
                                    <div className='edit' >
                                        <Link to='/edit'>
                                            Edit
                                        </Link>
                                    </div>
                                    <ReactAplayer
                                        theme='#F57F17'
                                        listMaxHeight='70vh'
                                        onInit={this.initAPlayer}
                                        audio={audioList}
                                    />
                                </div>
                                : <p>At first there was nothing...</p>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default Home
