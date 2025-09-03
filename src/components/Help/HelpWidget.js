import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function HelpWidget(){
	const { user, userType } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState('help'); // 'help' | 'chat'
	const [faqQuery, setFaqQuery] = useState('');
	const [faqResults, setFaqResults] = useState([]);
	const [message, setMessage] = useState('');
	const [attachments, setAttachments] = useState([]);
	const [presence, setPresence] = useState('online'); // demo online/offline

	const context = useMemo(()=>{
		const role = user?.role || userType || 'guest';
		const displayName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Guest';
		const maskedEmail = user?.email ? user.email.replace(/(^.).*(@.).*(\..*$)/, '$1***$2***$3') : '';
		const maskedPhone = user?.phone ? user.phone.replace(/.(?=.{2})/g, '*') : '';
		return {
			userId: user?.id || null,
			role,
			displayName,
			maskedEmail,
			maskedPhone,
			url: typeof window !== 'undefined' ? window.location.href : '',
			language: typeof navigator !== 'undefined' ? navigator.language : 'en',
			userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
			timezone: Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || 'UTC',
		};
	}, [user, userType]);

	useEffect(()=>{
		let mounted = true;
		const checkPresence = async ()=>{
			try {
				const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
				const res = await fetch(`${base}/help/presence`).then(r=>r.json()).catch(()=>({ online:true }));
				if (mounted) setPresence(res?.online ? 'online' : 'offline');
			} catch { if (mounted) setPresence('online'); }
		};
		checkPresence();
		const id = setInterval(checkPresence, 30000);
		return ()=>{ mounted = false; clearInterval(id); };
	},[]);

	const onSelectFiles = (e) => {
		const files = Array.from(e.target.files || []);
		const filtered = files.filter((f)=>{
			const okType = /^(image\/jpeg|image\/png|image\/webp|application\/pdf)$/i.test(f.type);
			const okSize = f.size <= (Number(process.env.REACT_APP_HELP_MAX_ATTACH_MB||5) * 1024 * 1024);
			return okType && okSize;
		});
		setAttachments((prev)=>[...prev, ...filtered].slice(0,5));
		// reset input
		e.target.value = '';
	};

	const sendMessage = async () => {
		if (!message.trim() && attachments.length === 0) return;
		try {
			const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
			// Demo: just log and clear; future: upload attachments then send payload
			// eslint-disable-next-line no-console
			console.log('HelpWidget send', { message, attachments, context });
			await fetch(`${base}/help/messages`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ message, hasAttachments: attachments.length>0, context }) }).catch(()=>{});
			setMessage('');
			setAttachments([]);
		} catch {}
	};

	return (
		<>
			{/* Floating button */}
			<button
				type="button"
				onClick={()=> setIsOpen(true)}
				className="fixed bottom-5 right-5 z-[60] bg-hodhod-gold hover:bg-hodhod-gold-dark text-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center"
				aria-label="Help Center"
			>
				?
			</button>

			{/* Drawer */}
			{isOpen && (
				<div className="fixed inset-0 z-[60]">
					<div className="absolute inset-0 bg-black/40" onClick={()=> setIsOpen(false)} />
					<div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col">
						<div className="px-4 py-3 border-b flex items-center justify-between">
							<div className="font-semibold">Help Center</div>
							<button className="text-gray-500 hover:text-gray-900" onClick={()=> setIsOpen(false)}>✕</button>
						</div>
						<div className="px-4 pt-3">
							<div className="inline-flex rounded-full border p-1 bg-gray-50">
								<button className={`px-3 py-1 text-sm rounded-full ${activeTab==='help'?'bg-white shadow':''}`} onClick={()=> setActiveTab('help')}>Help</button>
								<button className={`px-3 py-1 text-sm rounded-full ${activeTab==='chat'?'bg-white shadow':''}`} onClick={()=> setActiveTab('chat')}>Chat</button>
							</div>
							{presence==='offline' && (
								<div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">We are currently offline. We will email you when we reply.</div>
							)}
						</div>
						<div className="flex-1 overflow-auto px-4 py-3">
							{activeTab==='help' ? (
								<div>
									<input value={faqQuery} onChange={(e)=> setFaqQuery(e.target.value)} placeholder="Search help..." className="w-full input-field" />
									<div className="mt-3 space-y-2 text-sm text-gray-700">
										{(faqResults.length? faqResults : [
											{ id:'faq-1', q:'How to place a bid?', a:'Open an auction and click Place Bid, then enter your amount.'},
											{ id:'faq-2', q:'How to contact a provider?', a:'Open the provider profile and use the Chat button.'}
										]).map((f)=> (
											<details key={f.id} className="border rounded p-2">
												<summary className="font-medium cursor-pointer">{f.q}</summary>
												<div className="mt-1 text-gray-600">{f.a}</div>
											</details>
										))}
									</div>
								</div>
							) : (
								<div className="flex flex-col h-full">
									<div className="flex-1 overflow-auto space-y-2 text-sm text-gray-700">
										<div className="text-center text-gray-500 mt-8">Start a conversation with our team.</div>
									</div>
									<div className="border-t p-2 space-y-2">
										{attachments.length>0 && (
											<div className="flex flex-wrap gap-2">
												{attachments.map((f,idx)=> (
													<div key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded">
														{f.name}
														<button className="ml-2 text-red-600" onClick={()=> setAttachments((prev)=> prev.filter((_,i)=> i!==idx))}>×</button>
													</div>
												))}
											</div>
										)}
										<div className="flex items-center gap-2">
											<label className="btn-outline cursor-pointer">
												Attach
												<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" multiple onChange={onSelectFiles} />
											</label>
											<textarea value={message} onChange={(e)=> setMessage(e.target.value)} rows={2} placeholder="Type your message..." className="input-field flex-1" />
											<button className="btn-primary" onClick={sendMessage}>Send</button>
										</div>
									</div>
								</div>
							)}
						</div>
						</div>
					</div>
				)}
			</>
	);
}


