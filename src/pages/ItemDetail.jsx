import { Link, useNavigate, useParams } from "react-router-dom"
import Input from "../components/Input"
import Button from "../components/Button"
import { useItemStore } from "../store/useItemStore"
import { useEffect, useState } from "react"
import { useUserStore } from "../store/useUserStore"
import { api } from "../api/api"

const ItemDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { session } = useUserStore()
    const getItems = useItemStore((state) => state.getItems)
    const [item, setItem] = useState(undefined)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [bids, setBids] = useState([])
    const [timerId, setTimerId] = useState(undefined)

    useEffect(() => {
        const load = async () => {
            setIsLoading(true)
            try {
                setItem((await api.getItems(id)).data)
            } catch (error) {
                console.error(error)
                setError(error.message || "Что-то пошло не так")
            } finally {
                setIsLoading(false)
            }
        }
        const loadBids = async () => {
            setIsLoading(true)
            try {
                setBids((await api.getItemBids(id)).data)
            } catch (error) {
                console.error(error)
                setError(error.message || "Что-то пошло не так")
            } finally {
                setIsLoading(false)
            }
        }
        load()
        loadBids()
        setTimerId(setInterval(() => {
            (async () => {
                try {
                    setItem(await res.data)
                } catch (error) { }
            })()
        }, 10000))
        return () => {
            clearInterval(timerId)
        }
    }, [])

    const handleBid = async (e) => {
        e.preventDefault()
        setError('')

        const form = e.target
        const amount = Number(form.bidInput.value)

        try {
            await api.createBid({ id, amount })
            form.reset()
            await api.getItems()
        } catch (err) {
            setError(err?.message ?? String(err))
        }
    }

    const handleDelete = async () => {
        setError("")
        try {
            await api.deleteItems(id)
            await getItems()
            navigate("/")
        } catch (err) {
            setError(err.response?.data?.error || err.message)
        }
    }

    if (!item) return <div className="container">Загрузка...</div>

    const isOwner = session?.user?.id === item.userId

    return (
        <div className="container">

            <Link to={"/"}>← Вернуться к списку товаров</Link>

            <div className="item-detail">
                {error && (
                    <div className="alert alert-error active">
                        {error}
                    </div>
                )}
                {item && (
                    <>
                        <div className="item-header">
                            <div>
                                <img src={item.imageUrl} className="item-image-large" />
                            </div>
                            <div className="item-info">
                                <span className="item-status">{item.status}</span>
                                <h1 className="item-title-large">{item.title}</h1>
                                <div className="item-seller-info">
                                    <div className="seller-avatar">TS</div>
                                    <div className="seller-details">
                                        <div className="seller-name">{item.username}</div>
                                        <div className="seller-date">{new Date(item.createdAt).toLocaleString('ru-RU')}</div>
                                    </div>
                                </div>

                                <div className="item-description-full">
                                    {item.description}
                                </div>

                                <div className="price-section">
                                    <div className="starting-price">Начальная цена:</div>
                                    <div className="current-price">{item.price}</div>
                                    <div className="highest-bid">Текущая ставка: {item.highestBid == null ? "Ставок нет" : item.highestBid}</div>

                                    <form className="bid-form" onSubmit={handleBid}>
                                        <Input
                                            type="number"
                                            name="bidInput"
                                            className="bid-input"
                                            placeholder="Введите вашу ставку (мин. 70 001 ₽)"
                                            min={item.highestBid ?? item.price}
                                            step="100"
                                        />
                                        <Button type="submit" className="btn-bid">Сделать ставку</Button>
                                    </form>

                                    {isOwner && (
                                        <Button type="button" onClick={handleDelete}>Удалить товар</Button>
                                    )}
                                </div>

                            </div>
                        </div>
                        <div className="bids-section">
                            <div className="bids-header">
                                <h2 className="bids-title">История ставок</h2>
                                <span className="bids-count">{bids.length}</span>
                            </div>

                            <div className="bids-list">
                                <div className="bid-item highest-bid-item">
                                    <div className="bid-user">
                                        <div className="bid-avatar">BB</div>
                                        <div className="bid-details">
                                            <span className="bid-username">{bids[0]}</span>
                                            <span className="bid-time">2 часа назад</span>
                                        </div>
                                        <span className="highest-badge">🏆 Лидирует</span>
                                    </div>
                                    <div className="bid-amount">70 000 ₽</div>
                                </div>

                                <div className="bid-item">
                                    <div className="bid-user">
                                        <div className="bid-avatar">JD</div>
                                        <div className="bid-details">
                                            <span className="bid-username">john_doe</span>
                                            <span className="bid-time">5 часов назад</span>
                                        </div>
                                    </div>
                                    <div className="bid-amount">66 000 ₽</div>
                                </div>
                            </div>
                        </div>
                    </>)}
            </div>
        </div>
    )
}

export default ItemDetail
