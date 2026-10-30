import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Heart, Instagram, Menu, Minus, Plus, Search, ShoppingBag, Sparkles, Truck, UserRound, X } from 'lucide-react'

type Product = { id: number; name: string; category: string; price: number; image: string; color: string; badge?: string; description: string; }
type CartLine = { product: Product; quantity: number }
type Account = { name: string; email: string; token: string }
type RazorpayOptions = { key:string; amount:number; currency:string; name:string; description:string; order_id:string; prefill:{name:string;email:string}; theme:{color:string}; handler:(response:{razorpay_order_id:string;razorpay_payment_id:string;razorpay_signature:string})=>void }
declare global { interface Window { Razorpay?: new (options:RazorpayOptions)=>{open:()=>void;on:(event:'payment.failed',handler:(response:{error?:{description?:string}})=>void)=>void} } }

const products: Product[] = [
  { id: 1, name: 'Everyday Ceramic Set', category: 'Home', price: 4800, image: 'photo-1490312278390-ab64016e0aa9', color: 'Sand / 4 pieces', badge: 'Bestseller', description: 'Hand-finished stoneware for slow mornings and long dinners.' },
  { id: 2, name: 'The Sunday Tote', category: 'Accessories', price: 3600, image: 'photo-1544816155-12df9643f363', color: 'Natural canvas', description: 'A roomy, sturdy companion for your everyday.' },
  { id: 3, name: 'Cloud Knit Throw', category: 'Home', price: 9200, image: 'photo-1600210492486-724fe5c67fb0', color: 'Oatmeal / 130 × 170 cm', badge: 'Low stock', description: 'A soft, breathable layer woven from recycled cotton.' },
  { id: 4, name: 'Quiet Morning Candle', category: 'Wellness', price: 2800, image: 'photo-1603006905003-be475563bc59', color: 'Cedarwood & fig / 220 g', description: 'A warm, unhurried scent poured into reusable glass.' },
  { id: 5, name: 'Daily Journal', category: 'Stationery', price: 2400, image: 'photo-1517842645767-c639042777db', color: 'Forest / 192 pages', badge: 'New', description: 'A little space to think, plan, and make a mess.' },
  { id: 6, name: 'Sunday Glasses', category: 'Home', price: 3400, image: 'photo-1513558161293-cdaf765edfd4', color: 'Set of 2 / recycled glass', description: 'Light-catching, hand-blown glass for every day.' },
  { id: 7, name: 'Market Day Basket', category: 'Accessories', price: 5800, image: 'photo-1590874103328-eac38a683ce7', color: 'Natural / handwoven', description: 'A little more room for good finds and fresh flowers.' },
  { id: 8, name: 'Soft Form Vase', category: 'Home', price: 4200, image: 'photo-1578500494198-246f612d3b3d', color: 'Chalk / 24 cm', description: 'A sculptural, simple shape made to hold the everyday.' },
]
const categories = ['All finds', 'For you', 'Home', 'Accessories', 'Wellness', 'Stationery']
const money = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
const imageUrl = (id: string, w = 900) => id.startsWith('http') ? id : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`

function App() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'
  const aiUrl = import.meta.env.VITE_AI_URL || 'http://localhost:8001'
  const [catalog, setCatalog] = useState(products)
  const [recommendationIds, setRecommendationIds] = useState<number[]>(products.filter(p => p.badge).map(p => p.id))
  const [category, setCategory] = useState('All finds')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState<CartLine[]>([])
  const [notice, setNotice] = useState('')
  const [checkout, setCheckout] = useState(false)
  const [email, setEmail] = useState('')
  const [checkoutEmail, setCheckoutEmail] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [checkoutName, setCheckoutName] = useState('')
  const [account, setAccount] = useState<Account | null>(() => { try { const saved = localStorage.getItem('commongoods.account'); return saved ? JSON.parse(saved) as Account : null } catch { return null } })
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'offline'>('checking')

  useEffect(() => {
    fetch(`${apiUrl}/api/products`).then(r => { if (!r.ok) throw new Error(); return r.json() }).then((data: Array<{id:number;name:string;category:string;price:number;imageUrl:string;variant:string;description:string;featured:boolean}>) => {
      if (!data.length) throw new Error()
      setCatalog(data.map(p => ({ id:p.id, name:p.name, category:p.category, price:p.price, image:p.imageUrl, color:p.variant, description:p.description, badge:p.featured ? 'Thoughtfully picked' : undefined })))
      setApiStatus('connected')
    }).catch(() => setApiStatus('offline'))
  }, [])

  useEffect(() => { if (account) { setCheckoutEmail(account.email); setCheckoutName(account.name) } }, [account])

  useEffect(() => {
    let active = true
    fetch(`${aiUrl}/api/recommendations`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ products:catalog.map(p=>({id:p.id,category:p.category,featured:Boolean(p.badge)})), cart_ids:cart.map(line=>line.product.id), limit:6 }) })
      .then(r=>{if(!r.ok)throw new Error();return r.json()}).then(data=>{if(active&&Array.isArray(data.productIds))setRecommendationIds(data.productIds as number[])}).catch(()=>{if(active)setRecommendationIds(catalog.filter(p=>p.badge).map(p=>p.id))})
    return ()=>{active=false}
  }, [aiUrl,catalog,cart])

  const visibleProducts = useMemo(() => catalog.filter(p => (category === 'All finds' || (category === 'For you' ? recommendationIds.includes(p.id) : p.category === category)) && `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase())), [catalog, category, recommendationIds, search])
  const count = cart.reduce((sum, line) => sum + line.quantity, 0)
  const subtotal = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0)

  function addToCart(product: Product) {
    setCart(lines => {
      const found = lines.find(line => line.product.id === product.id)
      return found ? lines.map(line => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...lines, { product, quantity: 1 }]
    })
    setNotice(`${product.name} added to your bag`)
    window.setTimeout(() => setNotice(''), 2400)
  }
  function updateQuantity(id: number, delta: number) {
    setCart(lines => lines.map(line => line.product.id === id ? { ...line, quantity: line.quantity + delta } : line).filter(line => line.quantity > 0))
  }
  function subscribe(event: React.FormEvent) {
    event.preventDefault()
    if (email.includes('@')) { setNotice('You’re on the list. Look out for a little note from us.'); setEmail('') }
  }
  async function placeOrder(event: React.FormEvent) {
    event.preventDefault()
    if (!cart.length) return
    if (apiStatus === 'connected') {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (account) headers.Authorization = `Bearer ${account.token}`
        const response = await fetch(`${apiUrl}/api/orders`, { method: 'POST', headers, body: JSON.stringify({ email: checkoutEmail, fullName: checkoutName, deliveryAddress, items: cart.map(line => ({ productId: line.product.id, quantity: line.quantity })) }) })
        const order = await response.json()
        if (!response.ok) throw new Error(order.detail || order.message || 'We could not place this order. Please check your details and try again.')
        if (import.meta.env.VITE_RAZORPAY_KEY_ID) {
          const paymentResponse = await fetch(`${apiUrl}/api/payments/razorpay/order`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({reference:order.reference}) })
          const payment = await paymentResponse.json()
          if (!paymentResponse.ok) throw new Error(payment.detail || payment.message || 'The order was saved, but the payment window could not be started.')
          if (!window.Razorpay) {
            const loaded = await new Promise<boolean>(resolve => { const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.onload=()=>resolve(true);script.onerror=()=>resolve(false);document.body.appendChild(script) })
            if (!loaded) throw new Error('The payment form could not load. Your order remains pending.')
          }
          setCheckout(false); setCartOpen(false)
          const paymentWindow = new window.Razorpay!({ key:payment.keyId, amount:payment.amount, currency:payment.currency, name:'Common Goods', description:`Order ${order.reference}`, order_id:payment.id, prefill:{name:checkoutName,email:checkoutEmail}, theme:{color:'#59634f'}, handler:async result=>{
            try { const verified=await fetch(`${apiUrl}/api/payments/razorpay/verify`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reference:order.reference,razorpayOrderId:result.razorpay_order_id,razorpayPaymentId:result.razorpay_payment_id,razorpaySignature:result.razorpay_signature})}); const confirmation=await verified.json();if(!verified.ok)throw new Error(confirmation.detail||confirmation.message||'Payment needs support review. Keep your order reference.');setCart([]);setNotice(`Payment received. Order ${confirmation.reference} is confirmed.`) } catch(error) { setNotice(error instanceof Error?error.message:'Payment verification failed.') }
            window.setTimeout(()=>setNotice(''),6000)
          } })
          paymentWindow.on('payment.failed',result=>{setNotice(result.error?.description||`Payment failed. Order ${order.reference} is still pending.`);window.setTimeout(()=>setNotice(''),6000)})
          paymentWindow.open()
          return
        }
        setCheckout(false); setCart([]); setCartOpen(false)
        setNotice(`Order ${order.reference} placed. Payment is pending; no charge was made.`)
      } catch (error) { setNotice(error instanceof Error ? error.message : 'We could not place your order.') }
    } else {
      setCheckout(false); setCart([]); setCartOpen(false)
      setNotice('Demo order preview complete. Start the API and connect Razorpay test keys to place a real order.')
    }
    window.setTimeout(() => setNotice(''), 4500)
  }
  async function authenticate(event: React.FormEvent) {
    event.preventDefault()
    try {
      const response = await fetch(`${apiUrl}/api/auth/${authMode === 'register' ? 'register' : 'login'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authMode === 'register' ? { name: authName, email: authEmail, password: authPassword } : { email: authEmail, password: authPassword }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || result.message || 'Could not sign in. Check your details and try again.')
      const signedIn = { name: result.name, email: result.email, token: result.token } as Account
      localStorage.setItem('commongoods.account', JSON.stringify(signedIn)); setAccount(signedIn); setAuthOpen(false); setAuthPassword(''); setCheckoutEmail(signedIn.email); setCheckoutName(signedIn.name); setNotice(`Welcome${authMode === 'register' ? '' : ' back'}, ${signedIn.name.split(' ')[0]}.`)
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Could not sign in.') }
    window.setTimeout(() => setNotice(''), 4500)
  }

  return <>
    <div className="announcement"><span>Small things, made with care</span><span className="announce-center">Free shipping on orders over $75</span><a href="#story">Our point of view <ArrowUpRight size={13} /></a></div>
    <header className="header">
      <button className="icon-btn mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={20} /></button>
      <a className="wordmark" href="#top">common<span>goods</span><i>.</i></a>
      <nav className={menuOpen ? 'main-nav menu-active' : 'main-nav'}>{['Shop all', 'Home', 'Accessories', 'Wellness', 'Our story'].map((item, i) => <a key={item} href={i === 4 ? '#story' : '#shop'} onClick={() => { if (i > 0 && i < 4) setCategory(item === 'Shop all' ? 'All finds' : item); setMenuOpen(false) }}>{item}</a>)}</nav>
      <div className="header-actions"><button className="icon-btn search-trigger" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}><Search size={19} /></button><button className="account-button" onClick={() => account ? (localStorage.removeItem('commongoods.account'), setAccount(null), setNotice('You’ve signed out.')) : setAuthOpen(true)} aria-label={account ? 'Sign out' : 'Sign in'}><UserRound size={16} /><span>{account ? 'Sign out' : 'Sign in'}</span></button><button className="bag-button" onClick={() => setCartOpen(true)} aria-label={`Shopping bag, ${count} items`}><span>Bag</span><span className="bag-count">{count}</span></button></div>
    </header>
    {searchOpen && <div className="search-panel"><Search size={17} /><input autoFocus placeholder="Try ‘ceramic’ or ‘candle’" value={search} onChange={e => { setSearch(e.target.value); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }) }} /><button className="icon-btn" onClick={() => { setSearchOpen(false); setSearch('') }}><X size={18} /></button></div>}

    <main id="top">
      <section className="hero">
        <img className="hero-image" src={imageUrl('photo-1600210492486-724fe5c67fb0', 1800)} alt="A warm, sunlit living room with considered, natural textures" />
        <div className="hero-shade" />
        <div className="hero-content"><span className="eyebrow light"><Sparkles size={13} /> A softer kind of shopping</span><h1>Good things.<br /><em>Thoughtfully found.</em></h1><p>Useful, beautiful things for the everyday.<br />Made by people who care how things are made.</p><a className="button button-light" href="#shop">Meet your next favorite <ArrowRight size={16} /></a></div>
        <span className="hero-caption">01 / THE SLOW LIVING EDIT&nbsp;&nbsp; · &nbsp;&nbsp;OBJECTS FOR ORDINARY DAYS</span><a className="hero-scroll" href="#shop"><ArrowDown size={14} /> SCROLL A LITTLE</a>
      </section>

      <section className="promise-row"><span><Truck size={18} /> Thoughtful shipping, always</span><span><Check size={18} /> 30-day easy returns</span><span><Heart size={18} /> Made to last, made responsibly</span></section>

      <section className="editorial section-pad" id="story"><div className="editorial-photo"><img src={imageUrl('photo-1616486338812-3dadae4b4ace')} alt="Natural materials and simple, timeless homeware" /><span className="image-note">Fewer, better things.</span></div><div className="editorial-copy"><span className="eyebrow">A note from us</span><h2>More meaning.<br /><em>A little less stuff.</em></h2><p>We believe the things we live with should bring us joy, do their job well, and leave the world a little better. So we look for thoughtful makers, honest materials, and designs that feel like they’ve always belonged.</p><a className="text-link" href="#values">Get to know us <ArrowRight size={16} /></a><span className="editorial-sign">Here for the everyday, <i>the Common Goods team</i></span></div></section>

      <section className="collection section-pad" id="shop"><div className="collection-top"><div><span className="eyebrow">A few things we love</span><h2>Find your <em>everyday.</em></h2></div><a className="text-link desktop-link" href="#shop" onClick={() => setCategory('All finds')}>Explore all finds <ArrowRight size={16} /></a></div>
        <div className="collection-toolbar"><div className="category-tabs" role="tablist" aria-label="Product category">{categories.map(cat => <button key={cat} className={category === cat ? 'category-tab active' : 'category-tab'} onClick={() => setCategory(cat)}>{cat}</button>)}</div><span className="product-count">{visibleProducts.length} considered finds <ChevronDown size={13} /></span></div>
        {visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product, index) => <article className="product-card" key={product.id} style={{ animationDelay: `${index * 55}ms` }}><button className="product-image-wrap" onClick={() => addToCart(product)} aria-label={`Add ${product.name} to bag`}><img src={imageUrl(product.image, 700)} alt={product.name} loading="lazy" />{product.badge && <span className="product-badge">{product.badge}</span>}<span className="quick-add"><Plus size={15} /> Add to bag</span><span className="image-index">0{product.id}</span></button><div className="product-info"><div><h3>{product.name}</h3><p>{product.color}</p></div><strong>{money(product.price)}</strong></div><p className="product-description">{product.description}</p></article>)}</div> : <div className="empty-search">Nothing here just yet. Try another search or <button onClick={() => { setSearch(''); setCategory('All finds') }}>see all finds.</button></div>}
        <a className="button button-outline mobile-explore" href="#shop" onClick={() => setCategory('All finds')}>Explore all finds <ArrowRight size={16} /></a>
      </section>

      <section className="values section-pad" id="values"><div className="values-heading"><span className="eyebrow">What matters to us</span><h2>Good for your home.<br /><em>Thoughtful of ours.</em></h2></div><div className="values-list"><article><span>01</span><div><h3>Made with intention</h3><p>Small-batch pieces and responsible materials, chosen with care.</p></div><ArrowUpRight size={17} /></article><article><span>02</span><div><h3>People over product</h3><p>We put independent makers and the people behind the work first.</p></div><ArrowUpRight size={17} /></article><article><span>03</span><div><h3>Keep it for years</h3><p>Quality you can feel. Designs that don’t ask for your attention.</p></div><ArrowUpRight size={17} /></article></div></section>

      <section className="newsletter" id="newsletter"><div className="newsletter-inner"><span className="eyebrow light">A good note, now and then</span><h2>A little more <em>good.</em><br />In your inbox.</h2><p>New finds, little stories, and 10% off your first order.</p><form onSubmit={subscribe}><input type="email" required placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} /><button type="submit" aria-label="Subscribe"><ArrowRight size={18} /></button></form><span className="newsletter-fine">No noise. Unsubscribe whenever.</span></div><div className="newsletter-decoration">C<span>G</span>.</div></section>
    </main>

    <footer className="footer"><div className="footer-top"><a className="wordmark footer-mark" href="#top">common<span>goods</span><i>.</i></a><p>Thoughtful things for everyday life.<br />A little more meaning, in the small stuff.</p><a className="social-link" href="https://instagram.com" aria-label="Instagram"><Instagram size={18} /> Say hello on Instagram <ArrowUpRight size={13} /></a></div><div className="footer-links"><div><span>THE GOOD STUFF</span><a href="#shop">Shop all finds</a><a href="#shop">Home & living</a><a href="#shop">Small comforts</a></div><div><span>HERE TO HELP</span><a href="#footer">Shipping & returns</a><a href="#footer">Frequently asked</a><a href="mailto:hello@commongoods.store">Get in touch</a></div><div><span>OUR LITTLE WORLD</span><a href="#story">Our story</a><a href="#values">What matters</a><a href="#newsletter">The good note</a></div><div className="footer-note"><span>A NOTE ON THIS STORE</span><p>Independent makers. Thoughtful objects.<br />A happier home starts with less.</p><span className="status-pill"><i className={`status-dot ${apiStatus}`} />{apiStatus === 'connected' ? 'Store API connected' : apiStatus === 'offline' ? 'Demo mode · API offline' : 'Connecting to store API'}</span></div></div><div className="footer-bottom" id="footer"><span>© 2026 Common Goods Studio</span><span>Made for the everyday, with care <Heart size={13} /></span><div><a href="#footer">Privacy</a><a href="#footer">Terms</a><span>INR&nbsp; ₹</span></div></div></footer>

    {notice && <div className="toast"><Check size={17} />{notice}<button className="toast-close" onClick={() => setNotice('')}><X size={16} /></button></div>}
    {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={e => e.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow">A few good things</span><h2>Your bag <span>({count})</span></h2></div><button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Close bag"><X size={20} /></button></div>{cart.length ? <><div className="cart-lines">{cart.map(line => <div className="cart-line" key={line.product.id}><img src={imageUrl(line.product.image, 260)} alt="" /><div className="cart-line-info"><strong>{line.product.name}</strong><span>{line.product.color}</span><div className="quantity"><button aria-label="Remove one" onClick={() => updateQuantity(line.product.id, -1)}><Minus size={12} /></button><span>{line.quantity}</span><button aria-label="Add one" onClick={() => updateQuantity(line.product.id, 1)}><Plus size={12} /></button></div></div><strong className="cart-line-price">{money(line.product.price * line.quantity)}</strong></div>)}</div><div className="cart-bottom"><div className="shipping-meter"><span>{subtotal >= 75 ? 'You’ve unlocked free shipping!' : `You’re ${money(75 - subtotal)} away from free shipping`}</span><div><i style={{ width: `${Math.min(100, subtotal / 75 * 100)}%` }} /></div></div><div className="subtotal"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><p className="tax-note">Shipping and taxes calculated at checkout.</p><button className="button checkout-button" onClick={() => setCheckout(true)}>Continue to checkout <ArrowRight size={17} /></button><button className="continue-shopping" onClick={() => setCartOpen(false)}><ArrowLeft size={14} /> Keep looking</button></div></> : <div className="cart-empty"><span><ShoppingBag size={23} /></span><h3>Your bag feels a little light.</h3><p>Let’s find something that feels like you.</p><button className="button button-outline" onClick={() => setCartOpen(false)}>Explore the collection <ArrowRight size={15} /></button></div>}</aside></div>}
    {checkout && <div className="overlay" onClick={() => setCheckout(false)}><form className="checkout-modal" onSubmit={placeOrder} onClick={e => e.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow">Almost yours</span><h2>Checkout</h2></div><button type="button" className="icon-btn" onClick={() => setCheckout(false)}><X size={20} /></button></div><p className="checkout-copy">Your things are ready for a new home. Add your delivery details to place this order.</p><label>Your name<input required maxLength={150} placeholder="First and last name" value={checkoutName} onChange={e => setCheckoutName(e.target.value)} /></label><label>Email address<input type="email" required placeholder="you@example.com" value={checkoutEmail} onChange={e => setCheckoutEmail(e.target.value)} /></label><label>Delivery address<input required maxLength={500} placeholder="Street, city, postal code" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} /></label><div className="checkout-summary"><span>{count} items</span><strong>{money(subtotal)}</strong></div><div className="payment-note"><span className="payment-dot" /> Razorpay test mode · payment not charged</div><button className="button checkout-button" type="submit">Place order <ArrowRight size={17} /></button><small>Payment setup is required before any charge can be taken.</small></form></div>}
    {authOpen && <div className="overlay" onClick={() => setAuthOpen(false)}><form className="checkout-modal" onSubmit={authenticate} onClick={e => e.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow">Your own little corner</span><h2>{authMode === 'login' ? 'Welcome back' : 'Make an account'}</h2></div><button type="button" className="icon-btn" onClick={() => setAuthOpen(false)}><X size={20} /></button></div><p className="checkout-copy">Save your details and keep track of your orders.</p>{authMode === 'register' && <label>Your name<input required maxLength={100} placeholder="First and last name" value={authName} onChange={e => setAuthName(e.target.value)} /></label>}<label>Email address<input type="email" required placeholder="you@example.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} /></label><label>Password<input type="password" required minLength={8} maxLength={100} placeholder="At least 8 characters" value={authPassword} onChange={e => setAuthPassword(e.target.value)} /></label><button className="button checkout-button" type="submit">{authMode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={17} /></button><button type="button" className="auth-switch" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button></form></div>}
  </>
}

export default App
