import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Loadable from 'react-loadable'

import Home from './Home.js'

const Edit = Loadable({
    loader: () => import('./Edit.js'),
    loading: () => <p>...</p>
})

const Router = () => (
    <main>
        <Switch>
            <Route exact path='/' component={Home} />
            <Route exact path='/edit' component={Edit} />
        </Switch>
    </main>
)

export default Router