'use client'
import React, { use, useCallback, useEffect, useState } from 'react'
import { useLHSession } from '@components/Contexts/LHSessionContext'
import { getOrganizationContextInfoWithoutCredentials } from '@services/organizations/orgs'
import { getCommunities } from '@services/communities/communities'
import {
  getDiscussions, createDiscussion, upvoteDiscussion, removeUpvote,
  getComments, createComment, getLabelInfo, DISCUSSION_LABELS,
  type DiscussionWithAuthor, type DiscussionCommentWithAuthor, type DiscussionSortBy,
} from '@services/communities/discussions'
import {
  MessagesSquare, ArrowBigUp, MessageCircle, Send, Pin, Loader2, Sparkles,
} from 'lucide-react'
import {
  SERIF, PLUM, PURPLE, LILAC, CARD_BORDER, INK, MUTED, PERI, TAGLINE, CARD_STYLE, SHADOW,
} from '../_pmhnp/theme'

function authorName(d: { author: any }) {
  const a = d.author
  if (!a) return 'Member'
  const full = `${a.first_name || ''} ${a.last_name || ''}`.trim()
  return full || a.username || 'Member'
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('') || 'M'
}

function timeAgo(iso: string) {
  const then = new Date(iso.replace(' ', 'T')).getTime()
  const s = Math.max(1, Math.floor((Date.now() - then) / 1000))
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24); if (d < 30) return `${d}d ago`
  return new Date(iso.replace(' ', 'T')).toLocaleDateString()
}

function LabelChip({ label }: { label: string }) {
  const info = getLabelInfo(label)
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: `${info.color}1a`, color: info.color }}>
      {info.name}
    </span>
  )
}

export default function CommunityPage(props: { params: Promise<{ orgslug: string }> }) {
  const params = use(props.params)
  const orgslug = params.orgslug
  const session = useLHSession() as any
  const accessToken = session?.data?.tokens?.access_token

  const [communityUuid, setCommunityUuid] = useState<string | null>(null)
  const [communityName, setCommunityName] = useState<string>('PMHNP Mastery Community')
  const [discussions, setDiscussions] = useState<DiscussionWithAuthor[] | null>(null)
  const [sort, setSort] = useState<DiscussionSortBy>('recent')
  const [labelFilter, setLabelFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // composer
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [postLabel, setPostLabel] = useState<string>('general')
  const [posting, setPosting] = useState(false)

  // resolve community once
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const org: any = await getOrganizationContextInfoWithoutCredentials(orgslug)
        const list: any = await getCommunities(org.id, 1, 20, null, accessToken)
        if (cancelled) return
        const first = Array.isArray(list) ? list[0] : list?.data?.[0]
        if (first?.community_uuid) {
          setCommunityUuid(first.community_uuid)
          setCommunityName(first.name || 'PMHNP Mastery Community')
        } else {
          setError('The community space is being set up. Check back shortly.')
          setLoading(false)
        }
      } catch {
        if (!cancelled) { setError('Could not load the community right now.'); setLoading(false) }
      }
    })()
    return () => { cancelled = true }
  }, [orgslug, accessToken])

  const loadDiscussions = useCallback(async () => {
    if (!communityUuid) return
    setLoading(true)
    try {
      const res = await getDiscussions(communityUuid, sort, 1, 40, null, accessToken, labelFilter || undefined)
      setDiscussions(Array.isArray(res) ? res : [])
    } catch {
      setDiscussions([])
    } finally {
      setLoading(false)
    }
  }, [communityUuid, sort, labelFilter, accessToken])

  useEffect(() => { loadDiscussions() }, [loadDiscussions])

  const submitPost = async () => {
    if (!communityUuid || !accessToken || posting) return
    if (!title.trim()) return
    setPosting(true)
    try {
      await createDiscussion(communityUuid, {
        title: title.trim(), content: content.trim() || null, label: postLabel,
      }, accessToken)
      setTitle(''); setContent(''); setPostLabel('general')
      await loadDiscussions()
    } catch (e: any) {
      setError(e?.message || 'Could not post. Please try again.')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ backgroundColor: LILAC }}>
      <div className="mx-auto px-6 sm:px-10 py-12" style={{ maxWidth: 780 }}>
        {/* header */}
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl"
            style={{ background: `linear-gradient(140deg, ${PURPLE}, ${PERI})` }}>
            <MessagesSquare size={24} color="#fff" />
          </span>
          <div>
            <h1 className="pmhnp-serif text-3xl sm:text-[34px] font-semibold leading-tight" style={{ ...SERIF, color: PLUM }}>
              Community
            </h1>
            <p className="text-[13px]" style={{ color: MUTED }}>{communityName}</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed max-w-2xl" style={{ color: INK }}>
          Think out loud with fellow psychiatric NPs. Post a differential, share how a case played out, or
          ask what you would ask a trusted colleague. Evidence-based, collegial, and no patient identifiers.
        </p>

        {/* composer — visually distinct from the feed (tinted + elevated) */}
        <div className="mt-8 px-6 py-6" style={{ background: '#f7f3fd', border: '1px solid #ddcff2', borderRadius: 20, boxShadow: SHADOW.card }}>
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: PURPLE }} />
            <h2 className="pmhnp-serif text-[15px] font-semibold" style={{ ...SERIF, color: PLUM }}>Start a discussion</h2>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's on your mind? Give it a clear title."
            className="mt-3 w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ border: `1px solid ${CARD_BORDER}`, color: INK, backgroundColor: '#fff' }}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add the details, the context, the question. (optional)"
            rows={3}
            className="mt-2.5 w-full rounded-xl px-4 py-3 text-sm outline-none resize-y"
            style={{ border: `1px solid ${CARD_BORDER}`, color: INK, backgroundColor: '#fff' }}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px]" style={{ color: MUTED }}>Topic</span>
              <select
                value={postLabel}
                onChange={(e) => setPostLabel(e.target.value)}
                className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium outline-none"
                style={{ border: `1px solid ${CARD_BORDER}`, color: INK, backgroundColor: '#fff' }}
              >
                {DISCUSSION_LABELS.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <button
              type="button" onClick={submitPost} disabled={posting || !title.trim() || !communityUuid}
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: PURPLE }}>
              {posting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* controls */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-full p-1" style={{ backgroundColor: '#ece4f8' }}>
            {([['recent', 'Recent'], ['hot', 'Hot'], ['upvotes', 'Top']] as [DiscussionSortBy, string][]).map(([id, lbl]) => (
              <button key={id} onClick={() => setSort(id)}
                className="px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold transition-colors"
                style={sort === id ? { backgroundColor: '#fff', color: PLUM } : { color: MUTED }}>
                {lbl}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button onClick={() => setLabelFilter('')}
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={labelFilter === '' ? { backgroundColor: PURPLE, color: '#fff' } : { backgroundColor: '#ece4f8', color: MUTED }}>
              All
            </button>
            {DISCUSSION_LABELS.map((l) => (
              <button key={l.id} onClick={() => setLabelFilter(l.id)}
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={labelFilter === l.id ? { backgroundColor: l.color, color: '#fff' } : { backgroundColor: `${l.color}14`, color: l.color }}>
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* list */}
        <div className="mt-5 space-y-3.5">
          {loading && (
            <div className="flex items-center justify-center py-14">
              <Loader2 size={22} className="animate-spin" style={{ color: PURPLE }} />
            </div>
          )}
          {!loading && error && (
            <div className="bg-white shadow-sm px-6 py-8 text-center" style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 18 }}>
              <p className="text-sm" style={{ color: MUTED }}>{error}</p>
            </div>
          )}
          {!loading && !error && discussions?.length === 0 && (
            <div className="bg-white shadow-sm px-6 py-10 text-center" style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: 18 }}>
              <MessagesSquare size={30} style={{ color: PERI }} className="mx-auto" />
              <p className="mt-2 text-sm font-medium" style={{ color: PLUM }}>No discussions yet</p>
              <p className="text-[13px]" style={{ color: MUTED }}>Be the first to start one above.</p>
            </div>
          )}
          {!loading && !error && discussions?.map((d) => (
            <DiscussionCard key={d.discussion_uuid} d={d} accessToken={accessToken} />
          ))}
        </div>
      </div>
    </div>
  )
}

function DiscussionCard({ d, accessToken }: { d: DiscussionWithAuthor; accessToken?: string }) {
  const [voted, setVoted] = useState(d.has_voted)
  const [votes, setVotes] = useState(d.upvote_count)
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<DiscussionCommentWithAuthor[] | null>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const name = authorName(d)

  const toggleVote = async () => {
    if (!accessToken) return
    const next = !voted
    setVoted(next); setVotes((v) => v + (next ? 1 : -1))
    try {
      if (next) await upvoteDiscussion(d.discussion_uuid, accessToken)
      else await removeUpvote(d.discussion_uuid, accessToken)
    } catch {
      setVoted(!next); setVotes((v) => v + (next ? -1 : 1))
    }
  }

  const toggleComments = async () => {
    const nextOpen = !open
    setOpen(nextOpen)
    if (nextOpen && comments === null) {
      try {
        const res = await getComments(d.discussion_uuid, 1, 50, null, accessToken)
        setComments(Array.isArray(res) ? res : [])
      } catch { setComments([]) }
    }
  }

  const sendReply = async () => {
    if (!accessToken || !reply.trim() || sending) return
    setSending(true)
    try {
      const c = await createComment(d.discussion_uuid, { content: reply.trim() }, accessToken)
      setComments((prev) => [...(prev || []), c])
      setReply('')
    } catch { /* keep text so user can retry */ }
    finally { setSending(false) }
  }

  return (
    <div className="bg-white px-6 py-5 transition-all" style={{ ...CARD_STYLE }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = SHADOW.cardHover }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = SHADOW.card }}>
      <div className="flex gap-3.5">
        {/* vote rail */}
        <button onClick={toggleVote}
          className="flex flex-col items-center justify-start pt-0.5 shrink-0 select-none"
          style={{ color: voted ? PURPLE : MUTED }} aria-label="Upvote">
          <ArrowBigUp size={22} fill={voted ? PURPLE : 'none'} strokeWidth={voted ? 0 : 1.8} />
          <span className="text-[12px] font-semibold" style={{ color: voted ? PURPLE : INK }}>{votes}</span>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {d.is_pinned && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: PURPLE }}>
                <Pin size={12} /> Pinned
              </span>
            )}
            <LabelChip label={d.label} />
          </div>
          <h3 className="mt-1 text-[15px] font-semibold leading-snug" style={{ color: PLUM }}>
            {d.emoji ? `${d.emoji} ` : ''}{d.title}
          </h3>
          {d.content && (
            <p className="mt-1 text-[13.5px] leading-relaxed whitespace-pre-wrap" style={{ color: INK }}>{d.content}</p>
          )}
          <div className="mt-2.5 flex items-center gap-3 text-[12px]" style={{ color: MUTED }}>
            <span className="inline-flex items-center gap-1.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: PERI }}>
                {initials(name)}
              </span>
              {name}
            </span>
            <span>·</span>
            <span>{timeAgo(d.creation_date)}</span>
            <button onClick={toggleComments} className="inline-flex items-center gap-1 hover:underline">
              <MessageCircle size={13} /> {open ? 'Hide' : 'Reply'}
            </button>
          </div>

          {open && (
            <div className="mt-3.5 pl-1 border-l-2" style={{ borderColor: '#ece4f8' }}>
              <div className="pl-3 space-y-3">
                {comments === null && (
                  <div className="py-2"><Loader2 size={16} className="animate-spin" style={{ color: PURPLE }} /></div>
                )}
                {comments?.map((c) => {
                  const cn = authorName(c)
                  return (
                    <div key={c.comment_uuid} className="flex gap-2.5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-bold text-white shrink-0 mt-0.5" style={{ backgroundColor: PERI }}>
                        {initials(cn)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12.5px]"><span className="font-semibold" style={{ color: PLUM }}>{cn}</span>
                          <span className="ml-2" style={{ color: MUTED }}>{timeAgo(c.creation_date)}</span>
                        </p>
                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: INK }}>{c.content}</p>
                      </div>
                    </div>
                  )
                })}
                {comments?.length === 0 && (
                  <p className="text-[12.5px]" style={{ color: MUTED }}>No replies yet. Start the conversation.</p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') sendReply() }}
                    placeholder="Write a reply..."
                    className="flex-1 rounded-full px-3.5 py-2 text-[13px] outline-none"
                    style={{ border: `1px solid ${CARD_BORDER}`, color: INK, backgroundColor: '#faf8fe' }}
                  />
                  <button onClick={sendReply} disabled={sending || !reply.trim()}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full text-white disabled:opacity-50 shrink-0"
                    style={{ backgroundColor: PURPLE }} aria-label="Send reply">
                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
