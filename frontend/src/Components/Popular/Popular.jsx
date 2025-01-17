import React, { useEffect, useState } from 'react'
import './Popular.css'
import Item from '../Item/Item'
export const Popular = () => {

  const [popularProducts,setPopularProducts] = useState([]);

  useEffect(()=>{
    fetch('http://localhost:3000/popularinwomen')
    .then((response)=>response.json())
    .then((data)=>setPopularProducts(data));
  },[])

  return (
    <div className='popular'>
        <h1>POPULAR IN WOMEN</h1>
        <hr />
        <div className="popular-item">
            {popularProducts.map((item,i)=>{
                return <Item key={i} id={item && item.id} name={item && item.name} image={item && item.image} new_price={item && item.new_price} old_price={item && item.old_price}/>
            })}
        </div>
    </div>
  )
}
