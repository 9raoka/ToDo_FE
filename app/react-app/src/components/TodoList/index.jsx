import { useEffect, useState } from 'react';
import styles from './index.module.css'

const serverURL = 'http://localhost:8000'

const TodoList = () => {
    const [task, setTask] = useState('') // 追加したタスクを一時的に保持するステート
    const [todos, setTodos] = useState([])  
    const [error, setError] = useState(null) // エラーメッセージを保持するステート

    console.log(todos)
    
    useEffect(() =>{
        setError(null)
        // サーバーから初期のTodoリストを取得
        fetch(`${serverURL}/tasks/`)
        .then(response => response.json())
        .then(data => setTodos(data))
    }, [])

    const onSubmit = (e) => {
        e.preventDefault() 
        const newId = todos.length > 0 ? Math.max(...todos.map((todo) => todo.id)) + 1 : 1
        const newTodo = {task}
        console.log(newTodo)

        // 新しいTodoをサーバーに送信
        fetch(`${serverURL}/tasks/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"title":newTodo.task}),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('サーバーエラー: Todoの追加に失敗しました。')
            }
            return response.json()
        })
        .then(data => {
            setTodos([...todos, data])
            setTask('')
            setError(null)
        })
        .catch(err => setError(err.message))
    }

    const handleToggleDone = (id) => {
        // 選択されたTodoの状態を取得
        const targetTodo = todos.find(todo => todo.id === id);
        if (!targetTodo) {
            setError('タスクが見つかりません')
            return
        }

        const isCurrentlyDone = targetTodo.done;

        // doneがtrueならDELETEリクエストを送信
        if (isCurrentlyDone) {
            fetch(`${serverURL}/tasks/${id}/done`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('サーバーエラー: タスクの削除に失敗しました。')
                }
                // 成功したらDoneをFalseに
                setTodos((prevTodos) =>
                    prevTodos.map((todo) =>
                        todo.id === id ? { ...todo, done: false } : todo
                    )
                )
                setError(null);
            })
            .catch(err => setError(err.message));
        } else {
            fetch(`${serverURL}/tasks/${id}/done`, {
                method: 'PUT'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('サーバーエラー: タスクを完了できませんでした．')
                }
                return response.json()
            })
            .then(data => {
                setTodos((prevTodos) =>
                    prevTodos.map((todo) =>
                        todo.id === data.id ? { ...todo, done: true } : todo
                    )
                )
                setError(null); // エラーメッセージをクリア
            })
            .catch(err => setError(err.message))
        }
    }

    const handleDeleteTask = (id) => {
        // サーバーからタスクを削除
        fetch(`${serverURL}/tasks/${id}`, {
            method: 'DELETE'
        })
        .then(() => {
            setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id))
        })
    }

    return (
        <div>
        <h1>Todoリスト</h1>
        {error && <p className="error">{error}</p>} {/* エラーメッセージの表示 */}
            <form onSubmit={onSubmit}>
                <label htmlFor='task'>やること：</label>
                <input
                    type='text'
                    id='task'
                    name='task'
                    value={task}
                    onChange={(e) => {
                        setTask(e.target.value)
                    }}
                />
                <button type='submit'>
                    追加
                </button>
            </form>
            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
                        <label>
                            <input
                                type='checkbox'
                                checked={todo.done}
                                onChange={() => handleToggleDone(todo.id)}
                            />
                            <span className={todo.done ? styles.done : ''}>{todo.title}</span>
                        </label>
                        <button onClick={() => handleDeleteTask(todo.id)}>削除</button>
                    </li>
                ))}
            </ul>

        </div>
    )
}

export default TodoList