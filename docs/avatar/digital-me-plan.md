# The Digital Me — avatar plan (proposal, not yet approved)

Status: proposal. The Exploded Monolith remains the live centerpiece until this plan and the prototype at `/lab/avatar` are approved.

---

## 0. Honest framing

A photograph cannot be turned automatically into a premium, rigged, expressive web character. Today's photo-to-3D and image-to-3D tools give you one of two things:

- a quick likeness with poor topology and no face rig, or
- a rigged generic avatar with weak likeness.

A premium result needs a human pass in four places: head sculpt and stylisation, topology, the face rig (blendshapes), and the gestures (motion capture or hand animation).

The plan below keeps every automatable step automated and is explicit about where craft is needed.

---

## 1. Art direction

**One-line direction:** *the engineer in their studio.* A semi-stylised, softly lit person in the same dark architectural space as the rest of ATELIER / SYSTEM, wearing what they actually wear.

### Likeness cues from the reference photo

These are what the sculpt must preserve. They are what makes the avatar read as *you* rather than a generic young man.

- **Hair:** black, medium length, a soft centre parting that falls into curtains over the forehead, full volume at the sides. A few loose strands on top; keep 2–3 as hair cards, because they add life.
- **Brows:** straight and fairly full, set low over the eyes.
- **Eyes:** dark brown, slightly hooded, and they smile with the mouth.
- **Mouth:** an open, friendly smile. This becomes the "greeting" expression shape.
- **Face:** soft oval with a rounded jaw. The skin is light with a warm undertone.
- **Clothing:** a black zip jacket worn open over a white crew-neck T-shirt. This maps directly onto the site palette: void and graphite for the jacket, near-white for the tee.

### Stylisation rules

| Axis | Choice | Why |
|---|---|---|
| Proportion | Real anatomy, nudged about 10%. Head about 1:6.8 of body height, eyes 5–8% larger, hands slightly larger for readable gestures | Expressive at small sizes without turning into a cartoon |
| Surface | Simplified skin: no pores, soft subsurface approximation, gentle cheek colour; matte fabric; hair as cards with anisotropic sheen | Premium, not uncanny; cheap enough to render |
| Detail | Silhouette and face are the detail. Clothing has few folds; no logos | The face carries recognition |
| Light | The site's own rig: a cool ice-blue rim (`#8CAEFF`) from behind, a neutral key from upper left, almost no fill | Belongs to the same world as the rest of the site |
| Accent | Lime appears only in UI the avatar points at, never on the character | Lime stays the "look here" colour |
| Avoid | Robots, holograms, wireframe overlays, glowing eyes, the "metaverse avatar" look | Requested, and those read as gimmicks to recruiters |

### Style touchpoints

These are references for direction only; nothing is to be copied.

- **Pixar's *Soul* (the human characters in the real-world scenes):** restrained stylisation and readable faces.
- **Apple Memoji / Animoji:** how few, well-chosen facial shapes can carry emotion.
- **Lusion and Bruno Simon portfolio sites:** the bar for character-plus-scroll integration on the web.
- **Riot's *Arcane* character sheets:** painterly albedo with simple forms. Take the material language only, not the full painterly rendering.

---

## 2. Character creation and rigging workflow

### Recommended path: hybrid DIY or commissioned (best likeness-to-cost ratio)

1. **Reference capture (you, 30 minutes).** The photo and video set listed in section 7.
2. **Likeness head.** Build it in Blender with **KeenTools FaceBuilder**. It fits a clean, quad-topology head mesh to your photos by placing landmarks on 4–8 photos. Its output is a good likeness with animation-friendly topology. It is *not* stylised yet.
3. **Stylisation sculpt.** In Blender's sculpt mode, push the proportions per the rules above, simplify the forms, and fix the ears, eyelids and lips. *This is the craft step:* 1–3 days for a confident hobbyist, or hand it to a freelance character artist.
4. **Body and clothing.** Use a base body from **MPFB2** (the free MakeHuman for Blender, CC0 output) at the right height and build. Model the jacket and tee directly, or use Marvelous Designer for drape and retopologise afterwards.
5. **Hair.** Hair cards: about 30–60 textured strips, built with Blender's hair-to-mesh tools or a card generator. Strand hair is not viable in WebGL.
6. **Body rig.** Rigify, or Auto-Rig Pro (paid, simpler), exported with **Mixamo-compatible bone names**. Any Mixamo or mocap clip then retargets without remapping. The prototype already relies on this naming (`mixamorig:Head`, `LeftEye`, and so on).
7. **Face rig: ARKit's 52 blendshapes.** Use the **Faceit** add-on (paid) to generate them semi-automatically on the stylised head, then hand-fix blink, smile and the jaw. ARKit naming means the prototype's facial code (`eyeBlink_L`, `mouthSmile_R`, `eyeLookOut_L`, …) works unchanged. Eyes are separate meshes with eye bones, so gaze is a bone rotation, not a morph.
8. **Gestures.** Record **yourself** on a phone performing each gesture in section 3, then convert video to motion capture (Rokoko Vision, Move.ai or similar), retarget in Blender and clean up the keys. This is the meaningful part: the waving, pointing and thinking are your own movements, not a stock library. Mixamo clips are the fallback for any gesture that doesn't capture cleanly.
9. **Bake and export.** Bake textures into one atlas, export glTF/GLB, then optimise with `gltf-transform`: meshopt compression, KTX2/Basis textures, resampled and quantised animation, unused morphs pruned.

### Faster paths: considered, not recommended as final

| Tool type | What you get | Problem |
|---|---|---|
| Image-to-3D generators (Meshy, Tripo, Rodin, Hunyuan3D) | A stylised mesh in minutes | Triangle-soup topology, baked lighting, no face rig. Useful only as a sculpt reference or a concept test |
| Photo-to-avatar services (realistic, with ARKit blendshapes) | Rigged and fast | Realistic rather than stylised, generic bodies, and terms and availability change often. Check the current export licence before relying on one |
| Reallusion Character Creator + Headshot | Strong rigged result, ARKit-compatible | Paid; check the export licence for web/real-time use. Defaults lean realistic |
| MetaHuman | Superb face rig | Far too heavy for a web page, and strand hair can't be exported. Check the current licence for use outside Unreal |

### Effort and decision

- **DIY in Blender:** roughly 2–4 weeks part-time for someone learning, with FaceBuilder and Faceit carrying the technical load.
- **Commission:** brief a freelance character artist with sections 1, 3 and 6. Deliverables: a GLB with the named skeleton, ARKit blendshapes and the clips in section 3, within the section 6 budget.

**Decision needed from you: DIY or commission.**

---

## 3. Animation and gesture storyboard

The avatar is right of centre on desktop and the content sits on the left, so most gestures direct the eye *leftward into the content*.

| # | Moment | Trigger | Body | Face | Framing | Duration |
|---|---|---|---|---|---|---|
| 0 | Arrival | Page load, after LCP | Fades up from darkness with the key light; settles into idle | Neutral, then notices the cursor | Waist-up, right half | 1.2s |
| 1 | Greeting | Once per session, about 0.6s after arrival | Right-hand wave, 2 cycles, slight head tilt | Smile (mouthSmile + eyeSquint), brows up | Same | 2.0s |
| 2 | Idle | Default | Breathing (chest ±1.5%), weight shift every 6–10s, micro head drift | Blink every 2–6s, 15% double blinks | — | loop |
| 3 | "Here's my work" | Scroll enters Transformation → Work | Turns 20° left, right arm points at the Work heading, then the hand opens | Eyes lead the head toward the target, then return to the viewer | Camera eases to a 3/4 view | 1.6s |
| 4 | Step aside | Work stage expands | Steps back (scale 1 → 0.85), fades out | — | Avatar hidden: content takes focus | 0.6s |
| 5 | About me | About enters | Returns small, docked right. Hand to chin ("thinking"), then an open-palm "presenting" gesture toward the text | Thinking: eyes up-left, slight lip press. Presenting: soft smile | Chest-up, small | 2.4s |
| 6 | Hidden | Experience and Skills | — | — | Hidden, so dense content stays clean | — |
| 7 | Contact | Contact enters | Faces the viewer, two-hand presenting gesture toward the contact links, then relaxed idle | Warm smile, steady eye contact | Waist-up, beside the final headline | 1.8s |
| 8 | Reaction | Copy-email or link hover in Contact | Nod (or thumbs-up after a successful copy) | Brief smile and brow raise | — | 0.8s |
| 9 | Farewell | Contact fully in view for 4s, or the visitor scrolls back up | Small wave | Smile | — | 1.4s |

**Anti-repetition rules**
- Each cue fires once per scroll direction. Re-crossing a boundary plays a subtle acknowledgement (a nod or a glance), never the full gesture again.
- A global cooldown of 2.5s between gestures.
- Idle has 2–3 variants picked at random.
- The greeting plays once per session (stored in `sessionStorage`).

**Blending:** every clip enters and leaves through `crossFadeTo` at 0.35–0.5s. Face shapes are damped separately from the body, so a smile can linger after a gesture ends.

---

## 4. Cursor-tracking design

The tracking is applied **after** the animation mixer each frame, as an additive layer on top of the current pose. It works the same whether the avatar is idle or mid-gesture.

| Layer | Bones / shapes | Limits (yaw / pitch) | Damping half-life | Share of the look |
|---|---|---|---|---|
| Eyes | `LeftEye`, `RightEye` bones (or `eyeLook*` morphs) | ±28° / ±18° | 0.05s: fast, saccade-like | Leads |
| Head | `Head` | ±35° / ±20° | 0.22s | 60% |
| Neck | `Neck` | ±20° / ±12° | 0.30s | 25% |
| Upper torso | `Spine2` | ±10° / ±5° | 0.60s | Engages only when the target passes 60% of the head limit |

**How the target is set**
- **Target source:** the pointer is projected onto a plane at the avatar's head depth, so near and far gaze reads correctly. Eye convergence is computed per eye.
- **Behind the character:** clamped smoothly with a soft knee (`tanh`), so it never snaps.

**Idle return and natural motion**
- **Idle return:** after 2.5s without pointer movement, or when the pointer leaves the window, the target eases to a "soft focus" point near the camera. It then makes small glances every 1.5–4s.
- **Gesture override:** during "point", gaze blends 70% toward the gesture target; the eyes glance at the cursor and return.
- **Blinks:** also triggered by large gaze shifts (more than 20°), as real people blink on big eye movements.

**Touch, keyboard and reduced effects**
- **Touch devices:** there is no cursor. The avatar looks at the camera, with occasional glances in the scroll direction. A tap on the avatar triggers a short wave, rate-limited.
- **Keyboard users:** focusing a nav link or button makes the avatar glance toward that element's screen position, which is a nice detail. This is optional.
- **Reduced effects:** no tracking. The static image is shown.

---

## 5. Scroll synchronisation architecture

```
GSAP ScrollTrigger ──► avatarStore (plain mutable store, no React re-renders)
   │  per section: onEnter / onEnterBack / onLeave → director.cue("work" | "about" | ...)
   │  scrubbed:    framing progress (camera pos/fov, avatar x/scale/opacity)
   ▼
AvatarDirector (state machine, framework-free TS)
   states: arrival → greeting → idle ⇄ cue-gesture → hidden
   rules:  cooldowns, once-per-direction, session flags, reduced-effects bypass
   outputs: { clip, fade, faceTargets, gazeOverride, framing }
   ▼
R3F <Avatar> useFrame (single rAF):
   1. mixer.update(dt)            ← skeletal clips + crossfades
   2. face morph damping          ← blink/smile/brow targets
   3. look-at layer (post-mixer)  ← eyes → head → neck → spine, damped
   4. framing damp                ← camera + root transform from avatarStore
   5. invalidate() only while anything is unsettled or a clip plays
```

**Design choices**
- **Why not scrub gestures directly?** Scrubbing a wave with the scroll wheel looks like a puppet on strings. Gestures are **cue-triggered** and play at natural speed. Only **framing** (position, scale, camera, visibility) is scrubbed, then damped, so it feels attached to the scroll without jitter.
- **Ownership:** the same contract as today. GSAP owns scroll measurement, R3F owns everything 3D, Motion owns DOM micro-interactions. The existing `sceneStore` pattern is reused as `avatarStore`.
- **Single canvas:** one fixed canvas layer behind the content for the whole page, rather than a canvas per section. It is hidden (`frameloop` idle, `visibility: hidden`) while the avatar is in a hidden state.

---

## 6. Performance budget and mobile fallback

| Budget | Desktop (high tier) | Mobile / low tier |
|---|---|---|
| GLB download (meshopt + KTX2) | ≤ 2.5 MB | ≤ 1.2 MB (LOD1 + 1K textures, separate file) |
| Triangles | ≤ 25k (body 14k, head 6k, hair 5k) | ≤ 12k |
| Draw calls | ≤ 4 (body, head, hair, eyes) | ≤ 3 |
| Textures | 2048 atlas: albedo, ORM, normal | 1024 atlas, no normal map |
| Bones | ≤ 70, Mixamo naming (fingers: 3 per finger) | Same skeleton |
| Morph targets shipped | About 18 of the 52 ARKit shapes: blink ×2, smile ×2, squint ×2, brows ×4, jawOpen, mouthPress ×2, cheekSquint ×2, … | 8 (blink, smile, brows) |
| Animation clips | ≤ 300 KB total, 30 fps, quantised | Same, but only 4 clips are loaded |
| GPU frame cost | ≤ 4 ms on integrated GPUs | ≤ 6 ms |
| Load timing | After LCP, on idle; a poster image renders instantly | Poster first; 3D only on tap or idle |
| Idle | Renders only while animating or settling; paused off-screen or in a hidden tab | Same |

**Fallbacks**
- **No WebGL, `?tier=none`, or reduced effects:** a **static poster** rendered from the real model in Blender. It ships as a 1600px WebP (about 80 KB) plus a 2–3 frame sprite for the greeting, so reduced-motion users see no motion at all. Section cues become nothing; content is untouched.
- **Mobile design (distinct, not shrunk):** the avatar sits in the upper part of the hero at chest-up framing. It plays the greeting once, then holds idle; tap to wave. It does *not* follow the content down the page. It reappears only in Contact as a small portrait beside the email button. No torso tracking and no pointing.
- **Low tier:** LOD1, DPR ≤ 1.25, no shadows, blinking only on the face.

---

## 7. What I need from you

**Reference capture.** Same haircut and outfit throughout, even daylight, plain background, no glasses unless you normally wear them, neutral face except where noted.

1. **Head photos (about 12)**
   - Front, 3/4 left, 3/4 right, both profiles, top-down (for hair), back of the head.
   - All at eye level, about 1m away, using the phone's 1× lens: wide angle distorts faces.
2. **Expression photos (front)**
   - Neutral, closed-mouth smile, open smile (like your reference photo), eyebrows raised, a "thinking" face.
3. **Turnaround video:** a 30-second phone orbit around your head and shoulders. Someone else holds the phone; you stay still.
4. **Outfit:** front and back photos of the jacket and tee, or whichever outfit you want the avatar to wear.
5. **Approximate height and build** (optional, for proportions).
6. **Gesture performances** (phone video, full upper body in frame, 5–10s each)
   - Wave, point to your left, hand-to-chin thinking, open-palm presenting, two-hand presenting, nod, thumbs-up.
7. **Decisions**
   - DIY or commission (section 2).
   - Approve the art direction (section 1).
   - Approve the storyboard (section 3).
8. **Consent note:** the likeness model and poster will be published on your site. Decide whether the GLB itself should also be downloadable; by default it is fetched by the page and so can be extracted.

---

## 8. Prototype (`/lab/avatar`)

This is an isolated route, not linked from the site, with `noindex`.

- **Body:** *Xbot*, a properly rigged Mixamo-skeleton mannequin from the three.js examples. It is **placeholder only**, clearly labelled on screen, and will be removed. It has eye bones but no visible eyes.
- **Face:** *facecap*, a head with all 52 ARKit blendshapes from the three.js examples. **Placeholder only.** It proves the facial pipeline: eye-look, blink and smile driven by the same targets the final avatar will use.
- **What it demonstrates:**
  - layered cursor tracking (eyes → head → neck → spine) with limits and damping
  - idle return
  - procedural blinking
  - gesture clips (wave, point, think, present, nod) blended over idle with crossfades
  - the AvatarDirector state machine with cooldowns
  - scroll cues and scrubbed framing via GSAP over mock sections
  - reduced-effects and mobile behaviour
  - a debug panel showing the live state
- **The gestures are hand-keyed placeholders.** They are authored as bone-rotation keyframes on the placeholder skeleton to prove the plumbing. The final gestures come from your mocap (section 2, step 8).
