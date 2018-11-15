import React, { Component } from 'react'
import { List, Icon, Popconfirm, Button, Input } from 'antd'
import { Link } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import 'antd/dist/antd.css'
import '../Css/Edit.css'

class Edit extends Component {
    constructor() {
        super()
        this.removeSong = this.removeSong.bind(this)
        this.loadLocalStorage = this.loadLocalStorage.bind(this)
        this.state = {
            playlist: []
        }
    }

    componentDidMount() {
        this.setState({
            playlist: localStorage.getItem('playlist') ? JSON.parse(localStorage.getItem('playlist')) : []
        })
    }

    removeSong(videoID) {
        this.setState({
            playlist: this.state.playlist.filter(song => song.videoID !== videoID)
        }, () => localStorage.setItem('playlist', JSON.stringify(this.state.playlist)))
    }

    loadLocalStorage() {
        try {
            localStorage.setItem('playlist', this.refs.localStorage.input.value)
        } catch (e) { }
        this.refs.localStorage.input.value = ''
    }

    render() {
        return (
            <div className='editContent'>
                <Link className='back' to='/'><Button type='primary' shape='circle' icon='arrow-left' /></Link>
                <h1>the boring playlist</h1>
                <div className='wrapper'>
                    <h3 className='title'>idk:</h3>
                    <List
                        locale={{
                            emptyText: 'At first there was nothing...'
                        }}
                        bordered
                        dataSource={this.state.playlist.map(song => {
                            return <span key={song.videoID}>{song.title} - {song.author.name}</span>
                        })}
                        renderItem={item => {
                            return (
                                <List.Item actions={
                                    [
                                        <Popconfirm
                                            title='Are you sure?'
                                            onConfirm={this.removeSong.bind(this, item.key)}
                                            okText="Yes"
                                            cancelText="No">
                                            <Icon type="delete" />
                                        </Popconfirm>
                                    ]
                                }>{item}</List.Item>
                            )
                        }}
                    />
                    <Input
                        ref='localStorage'
                        className='localStorage'
                        onPressEnter={this.loadLocalStorage}
                        placeholder='Playlist local storage'
                    />

                    <Popconfirm
                        title='Are you sure you want to overwrite localStorage?'
                        onConfirm={this.loadLocalStorage}
                        okText="Yes"
                        cancelText="No">
                        <Button className='loadLocalStorage'>Load</Button>
                    </Popconfirm>
                    <p></p>
                    <CopyToClipboard text={localStorage.getItem('playlist') || []}>
                        <Button>Copy current localStorage</Button>
                    </CopyToClipboard></div>
            </div>
        )
    }
}

export default Edit
