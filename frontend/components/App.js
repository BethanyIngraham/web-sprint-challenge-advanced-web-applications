import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState(null)
  const [spinnerOn, setSpinnerOn] = useState(false)

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()
  const redirectToLogin = () => { 
    /* ✨ implement */
    navigate('/')
  }
  const redirectToArticles = () => {
     /* ✨ implement */ 
    navigate('articles')
  }

  const logout = () => {
    // ✨ implement
    // If a token is in local storage it should be removed,
    // and a message saying "Goodbye!" should be set in its proper state.
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.
    localStorage.removeItem('token')
    setMessage('Goodbye!')
    redirectToLogin()
  }

  const login = ({ username, password }) => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch a request to the proper endpoint.
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
    setMessage('')
    setSpinnerOn(true)
    fetch(loginUrl, {
      method: 'POST',
      body: JSON.stringify({
        username, 
        password
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      return res.json()
    })
    .then(data => {
      localStorage.setItem('token', data.token)
      setMessage(data.message)
      redirectToArticles()
    })
    .catch(err => {
      console.log(err)
    })
    .finally(() => setSpinnerOn(false))
  }

  const getArticles = () => {
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
    setMessage('')
    setSpinnerOn(true)
    const token = localStorage.getItem('token')
    fetch(articlesUrl, {
      headers: {
        Authorization: token
      }
    })
    .then(res => {
      if(!res.ok) {
        throw new Error(`Oh no! Status, ${res.status}`)
      }
      const contentType = res.headers.get('Content-Type')
      if(contentType.includes('application/json')) {
        return res.json()
      }
    })
    .then(data => {
     setArticles(data.articles)
     setMessage(data.message)
    })
    .catch(err => {
      if(err?.response?.status === 401) redirectToLogin()
      console.log('Something went wrong GETting the articles!',err)
    })
    .finally(() => setSpinnerOn(false))
  }

  const postArticle = article => {
    // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.
    const token = localStorage.getItem('token')
    fetch(articlesUrl, {
      method: 'POST',
      body: JSON.stringify({
       title: article.title,
       text: article.text,
       topic: article.topic
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    })
    .then(res => {
      if(!res.ok) {
        throw new Error(`Status, ${res.status}`)
      }
      return res.json()
    })
    .then(data => {
      setArticles(articles => [...articles, data.article])
      setMessage(data.message)
      setCurrentArticleId(null)
    })
    .catch(err => console.log('Something went wrong POSTing article',err))
  }

  const updateArticle = ({ article_id, article }) => {
    // ✨ implement
    // You got this!
    const token = localStorage.getItem('token')
    fetch(`${articlesUrl}/${article_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: article.title,
        text: article.text,
        topic: article.topic
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    })
    .then(res => {
      return res.json()
    })
    .then(data => {
      setArticles(articles =>
        articles.map(art => article_id === art.article_id ? article : art)
      )
      setMessage(data.message)
      setCurrentArticleId(null)
    })
    .catch(err => console.log(err))
  }

  const deleteArticle = article_id => {
    // ✨ implement
    const token = localStorage.getItem('token')
    fetch(`${articlesUrl}/${article_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    })
    .then(res => {
      if(!res.ok) {
        throw new Error(`Something went wrong DELETing article, ${res.status}`)
      }
      return res.json()
    })
    .then(data => {
      setArticles(articles => 
        articles.filter(article => article.article_id !== article_id)
      )
      setMessage(data.message)
    })
    .catch(err => console.log(err))
  }

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner on={spinnerOn}/>
      <Message message={message}/>
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login}/>} />
          <Route path="articles" element={
            <>
              <ArticleForm 
              currentArticle={currentArticleId && articles.find(art => art.article_id === currentArticleId)}
              setCurrentArticleId={setCurrentArticleId}  
              postArticle={postArticle}
              updateArticle={updateArticle}
              />
              <Articles 
              articles={articles} 
              getArticles={getArticles}
              currentArticleId={currentArticleId}
              setCurrentArticleId={setCurrentArticleId}
              deleteArticle={deleteArticle}
              />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2024</footer>
      </div>
    </>
  )
}

