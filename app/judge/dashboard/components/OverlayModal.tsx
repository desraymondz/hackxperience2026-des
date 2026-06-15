"use client";                                                                                                                                               
                                                                                                                                                                
    import { motion } from "framer-motion";                                                                                                                     
    import { C, FM, SPRING } from "../constants";                                                                                                               
    import { fmtDate } from "../scoring";                                                                                                                       
    import type { JudgeProject } from "@/lib/types";                                                                                                            
                                                                                                                                                                
    // Icons matching the design precisely                                                                                                                      
    const Icons = {
      folder: 
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
      </svg>,
      users:
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>,                                                                                                                                 
      tag:
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
        <path d="M7 7h.01"/>
      </svg>,
      clock:
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>,
      checkCircle:
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>,
      alignLeft:
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="21" x2="3" y1="6" y2="6"/>
        <line x1="15" x2="3" y1="12" y2="12"/>
        <line x1="17" x2="3" y1="18" y2="18"/>
      </svg>,
      lightning:
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>,
      layers:
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>,
      link:
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>,
      document:
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
        <path d="M14 2v6h6"/>
        <line x1="16" x2="8" y1="13" y2="13"/>
        <line x1="16" x2="8" y1="17" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>,                                                                                      
      external:
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15 3 21 3 21 9"/>
        <line x1="10" x2="21" y1="14" y2="3"/>
      </svg>
    };                                                                                                                                                          
                                                                                                                                                                
    function Card({ title, icon, children, style }: any) {                                                                                                      
      return (
        <div style={{
          background: C.bgPrimary, border: `1px solid ${C.borderLight}`, borderRadius: 8, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12, ...style }}>
          {(title || icon) && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.primary, fontFamily: FM, fontSize: 10, letterSpacing: "0.06em", fontWeight: 700}}>
              {icon && <span style={{ display: "flex" }}>{icon}</span>}{title}
            </div>
          )}
          <div style={{ fontFamily: FM, fontSize: 11, color: C.textPrimary, lineHeight: 1.6 }}>
            {children}
          </div>
        </div>                                                                                                                                                  
      );                                                                                                                                                        
    }                                                                                                                                                           
                                                                                                                                                                
    function LinkRow({ label, url }: { label: string; url?: string | null }) {                                                                                  
      if (!url) return null;                                                                                                                                    
      return (                                                                                                                                                  
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.bgPrimary}` }}>           
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.textPrimary, fontWeight: 600 }}>                                                    
            <span style={{ color: C.primary }}>{Icons.link}</span>                                                                                                  
            {label}                                                                                                                                             
          </div>                                                                                                                                                
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, color: C.textMuted, textDecoration: "none",
  fontSize: 10 }}>                                                                                                                                              
            <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url.replace(/^https?:\/\//, '')}</span>        
            {Icons.external}                                                                                                                                    
          </a>                                                                                                                                                  
        </div>                                                                                                                                                  
      );                                                                                                                                                        
    }                                                                                                                                                           
                                                                                                                                                                
    function SummaryRow({ icon, label, value, badge }: { icon: React.ReactNode; label: string; value?: string; badge?: React.ReactNode }) {                     
      return (                                                                                                                                                  
        <div style={{ display: "flex", alignItems: "center", padding: "4px 0" }}>                                                                               
          <div style={{ width: 140, display: "flex", alignItems: "center", gap: 8, color: C.textPrimary }}>                                                         
            <span style={{ color: C.textMuted }}>{icon}</span>                                                                                                       
            {label}                                                                                                                                             
          </div>                                                                                                                                                
          <div style={{ color: C.textPrimary, fontWeight: 600 }}>                                                                                                   
            {badge ? badge : value}                                                                                                                             
          </div>                                                                                                                                                
        </div>                                                                                                                                                  
      );                                                                                                                                                        
    }                                                                                                                                                           
                                                                                                                                                                
    export function OverlayModal({ project, onClose }: { project: JudgeProject; onClose: () => void }) {                                                        
      return (                                                                                                                                                  
        <motion.div                                                                                                                                             
          initial={{ opacity: 0 }}                                                                                                                              
          animate={{ opacity: 1 }}                                                                                                                              
          exit={{ opacity: 0 }}                                                                                                                                 
          transition={{ duration: 0.18 }}                                                                                                                       
          className="r-overlay-backdrop"                                                                                                                        
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",     
  padding: 20 }}                                                                                                                                                
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}                                                                                       
        >                                                                                                                                                       
          <style>{`                                                                                                                                             
            .modal-top-grid { display: grid; grid-template-columns: 360px 1fr; gap: 20px; }                                                                     
            @media (max-width: 1100px) {                                                                                                                        
              .modal-top-grid { grid-template-columns: 1fr; }                                                                                                   
            }
          `}</style>
                                                                                                                                                                
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0,    scale: 0.97, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={e => e.stopPropagation()}
            className="r-overlay-panel"
            style={{ width: "min(1200px, 100%)", maxHeight: "calc(100vh - 40px)", display: "flex", flexDirection: "column", background: C.bgPrimary, borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.2)", overflow: "hidden" }}
          >
            {/* Header */}
            <div style={{ background: C.bgPrimary, borderBottom: `1px solid ${C.borderLight}`, flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", fontFamily: FM, fontSize: 16, fontWeight: 700, color: C.textPrimary }}>
                  <span style={{ color: C.primary }}>&lt;/&gt;</span>
                  {project.name} // {project.teamName}
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span style={{ border: `1px solid ${C.borderSuccess}`, color: C.textSuccess, padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, fontFamily: FM }}>
                    SUBMITTED
                  </span>
                  <button
                    onClick={onClose}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: C.textMuted, display: "flex", padding: 4 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
                                                                                                                                                                
            {/* Scrollable body */}
            <div
              className="r-overlay-body"
              style={{ flex: 1, overflowY: "auto", padding: "24px", background: C.bgPrimary, display: "flex", flexDirection: "column" }}
            >
              <div className="modal-top-grid">
                {/* Thumbnail */}
                <div style={{ width: "100%", aspectRatio: "16/9", background: C.bgPrimary, border: `1px solid ${C.borderLight}`, borderRadius: 8, position: "relative", overflow: "hidden", flexShrink: 0 }}>
                  {project.thumbnailUrl ? (
                    <img src={project.thumbnailUrl} alt={`${project.name} thumbnail`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: FM, fontSize: 11, color: C.textMuted, letterSpacing: "0.1em" }}>[ NO THUMBNAIL ]</span>
                    </div>
                  )}
                </div>
                                                                                                                                                                
                {/* Project Summary */}
                <Card title="PROJECT SUMMARY">
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <SummaryRow icon={Icons.folder} label="Project Name" value={project.name} />
                    <SummaryRow icon={Icons.users} label="Team ID" value={project.teamId} />
                    <SummaryRow icon={Icons.tag} label="Track" value={project.track} />
                    <SummaryRow icon={Icons.clock} label="Submitted At" value={fmtDate(project.submittedAt)} />
                    <SummaryRow icon={Icons.clock} label="Last Updated" value={fmtDate(project.updatedAt)} />
                    <SummaryRow icon={Icons.checkCircle} label="Status" badge={<span style={{ border: `1px solid ${C.borderSuccess}`, color: C.textSuccess, padding: "2px 8px", borderRadius: 4, fontSize: 9, textTransform: "uppercase" }}>SUBMITTED</span>} />
                  </div>
                </Card>
                                                                                                                                                                
                {/* Description */}
                <Card title="DESCRIPTION" icon={Icons.alignLeft}>
                  {project.description || <span style={{ color: C.textMuted }}>No description provided.</span>}
                </Card>

                {/* Short Pitch */}
                <Card title="SHORT PITCH" icon={Icons.lightning}>
                  {project.pitch || <span style={{ color: C.textMuted }}>No pitch provided.</span>}
                </Card>

                {/* Tech Stack */}
                <Card title="TECH STACK" icon={Icons.layers}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {project.techStack.length > 0 ? project.techStack.map(t => (
                      <span key={t} style={{ padding: "6px 10px", background: C.bgPrimary, border: `1px solid ${C.primary}`, borderRadius: 4, fontFamily: FM, fontSize: 10, color: C.primary }}>
                        {t}
                      </span>
                    )) : <span style={{ color: C.textMuted }}>None specified</span>}
                  </div>
                </Card>
                                                                                                                                                                
                {/* Key Links */}
                <Card title="KEY LINKS & ASSETS" icon={Icons.link}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <LinkRow label="GitHub Repo" url={project.githubUrl} />
                    <LinkRow label="Live Demo" url={project.liveUrl} />
                    <LinkRow label="Pitch Deck" url={project.pitchDeckUrl} />
                    <LinkRow label="Deck File" url={project.pitchDeckFileUrl} />
                    <LinkRow label="Video Demo" url={project.videoDemoUrl} />
                    {!project.githubUrl && !project.liveUrl && !project.pitchDeckUrl && !project.pitchDeckFileUrl && !project.videoDemoUrl && (
                       <span style={{ color: C.textMuted, padding: "6px 0" }}>No links provided.</span>
                    )}
                  </div>
                </Card>
                                                                                                                                                                
                {/* Team Members */}
                <Card title={`TEAM MEMBERS (${project.members.length})`} icon={Icons.users}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 180, overflowY: "auto", paddingRight: 4 }}>
                    {project.members.map((m, i) => (
                      <div key={i} style={{ display: "flex", gap: 12 }}>
                        <div style={{ color: C.primary, fontWeight: 700, fontSize: 12, fontFamily: FM }}>{String(i + 1).padStart(2, "0")}</div>
                        <div style={{ fontFamily: FM }}>
                          <div style={{ color: C.textPrimary, fontWeight: 700, fontSize: 11 }}>{m.name}</div>
                          <div style={{ color: C.textMuted, fontSize: 9, marginTop: 4, wordBreak: "break-all" }}>
                            {m.email}{m.role ? `, ${m.role}` : ""}{m.studentId ? `, ${m.studentId}` : ""}
                          </div>
                          {i === 0 && (
                            <div style={{ marginTop: 6, display: "inline-block", padding: "2px 6px", border: `1px solid ${C.primary}`, color: C.primary, fontSize: 8, fontWeight: 700, borderRadius: 4 }}>
                              LEADER
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                                                                                                                                                                
                {/* Additional Notes */}
                <Card title="ADDITIONAL NOTES" icon={Icons.document}>
                  {project.notes || <span style={{ color: C.textMuted }}>No additional notes.</span>}
                </Card>
              </div>
            </div>
                                                                                                                                                                
            {/* Footer */}
            <div style={{ background: C.bgPrimary, borderTop: `1px solid ${C.borderLight}`, padding: "16px 24px", display: "flex", justifyContent: "flex-end", alignItems: "center", flexShrink: 0 }}>                                                                                                                                       
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={onClose}
                  style={{ padding: "10px 24px", background: C.bgPrimary, border: `1px solid ${C.borderMedium}`, borderRadius: 6, fontFamily: FM, fontSize: 11, fontWeight: 700, color: C.textPrimary, cursor: "pointer" }}                                                                                                                   
                >
                  CLOSE
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      );
    }