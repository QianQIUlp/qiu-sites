# Homepage Art Direction: Many Things, Little at First Sight

## 2026-09-22 · Current homepage

The user has approved the new me.qiu.works prototype and asked for it to be implemented in code: keep 「千秋」 (Qianqiu, the Chinese name), the real guitar, spatial wandering, the playable pedalboard and bilingual Chinese/English expression. The homepage's concrete composition follows this version; see the 2026-09-22 addendum in [`ink-and-light-study.md`](./ink-and-light-study.md). The original quote and the old exploration records below are kept in full; "person first, gradual discovery" remains the shared intent.

> This is the creative origin of the homepage, not a component spec, and not a product framework waiting to be executed mechanically.
> When an acceptance checklist, visual contract or implementation convenience conflicts with the feeling here, come back here and look again first.

## Qianqiu's original words

The recorded quote is kept verbatim in Chinese, followed by an English translation.

> 我有点担心你的生成结果，因为 Codex 有一个倾向，就是把一切东西过度工程化。
> 但是你要知道，UI 前端视觉表达这种东西靠的不是一套非常严谨的大的框架，
> 它靠的是一种感性直觉。你可能完全听不懂我在说什么，但我仍然要告诉你。
>
> 我之所以要说出这句话，是因为你说“不是要再靠视觉隐喻代言”，这是不对的，
> 靠的就是视觉隐喻代言。
>
> 我不希望一开始进去主页就是全部的东西，而是随着用户逐渐走到哪里，再展现出来。
> 我目前最不满的就是主页的整个表达效果：总感觉缺点什么，不够简约，东西太多，反而太乱。
> 我希望的效果是有很多东西，但刚开始很多东西并不用直接全部给到读者，而是他可以选择逐渐地去看。
>
> 一开始就先展示千秋和他的吉他、他的生活、这个人本身。然后再逐渐用阴影或光线，
> 或者用泼墨的感觉，让使用者、读者一步步去探索，发现：哦，原来还有这些不为人知的面。
> 我希望在主页里面实现这样的效果。
>
> 这个才是真正需要落盘的东西。我们在做艺术，不是毫无审美的工程。

English translation:

> I'm a bit worried about what you'll generate, because Codex has a tendency to over-engineer everything.
> But you need to understand that front-end visual expression doesn't rely on a very rigorous, big framework;
> it relies on an intuitive, emotional sense. You may not understand what I'm saying at all, but I still have to tell you.
>
> The reason I'm saying this is that you said "it shouldn't rely on visual metaphor to speak for it anymore." That's wrong —
> it is exactly visual metaphor that speaks for it.
>
> I don't want the homepage to show everything the moment you enter; things should appear as the user gradually walks somewhere.
> What I'm least happy with right now is the homepage's overall expression: it always feels like something is missing, it isn't minimal enough, there's too much, and it ends up too messy.
> The effect I want is that there are many things, but at the start many of them don't have to be handed to the reader all at once; instead they can choose to look gradually.
>
> At the start, first show Qianqiu and his guitar, his life, the person himself. Then gradually, with shadow or light,
> or with the feeling of splashed ink, let the user, the reader, explore step by step and discover: oh, so there are these unknown sides too.
> I want to achieve this effect on the homepage.
>
> This is what really needs to be written down. We're making art, not engineering without any aesthetic sense.

## The feeling to remember while implementing

The homepage's richness should live in depth, not be laid out at first glance. First sight should be quiet and empty, letting the name, the guitar and the breath of life
stay in the light first; the desk, workbench, article counts, project statuses and contact details can really exist but should first recede into shadow.

Only after the reader approaches, lingers, touches or chooses does the yielding of light, shadow and occlusion hand over the other side.
This is not a "click Next" tutorial, nor a dashboard that splits the person into modules. Readers should feel they discovered things in the room themselves,
rather than being walked through by the page in sequence.

Visual metaphor carries the first layer of understanding; the content behind it grounds that feeling in a real life and real work. Neither replaces the other:
without visual metaphor the homepage degrades into a text explanation; without real destinations the metaphor degrades into a hollow persona.

When judging a change, step away from code and rules first, shrink the page and look at first glance: where is it brightest, where is it quietest, who does the eye meet first,
and does the dark still make you want to approach? If the first glance explains everything at once, or exploring requires a long explanation to understand,
it has already drifted from this direction.

## Later correction: professionalism and visual center

The homepage does not need red seals and calligraphy to keep proving it is "artistic". The header drops the 「千秋」 red seal, and 「我是千秋。」 ("I am Qianqiu.") uses
a clear, stable regular heading font so the person's name appears professionally.

The three project cards in the engineering close-up take the author's annotated screenshot as their composition rule: MealCircuit on the upper-left desktop, Crewlight on the lower-left rack,
Hadoop Lab at the lower-right desk edge. Do not rewrite them into a triangle group or any other "optimized" composition on your own.

## Another correction: engineering close-up becomes horizontal single pedals

The engineering close-up no longer uses liquid-glass cards. The three projects stay strictly in the author's annotated upper-left, lower-left and lower-right positions,
and they must be three structurally different devices, not the same skin recolored: Docker-Hadoop takes the author-supplied horizontal Blue Driver
prototype as composition ground truth, keeping the top signal strip, the vertical gold knobs, the large central title and the black footswitch on the right; MealCircuit takes the Halfman OD's
dark wooden box, arranges three solid-wood knobs in a left column, lets an enlarged modern device nameplate in the middle carry the first visual layer, and keeps the red light and metal colored studs;
Crewlight compresses a vintage amp head into a horizontal single unit with leather piping, an enlarged cream six-knob panel, a cyan power light, a honeycomb grille and its own colored studs.
The cream control panel occupies only about the top third, and the honeycomb grille starts at its lower edge and covers at least 60% of the device. Control names, project nameplates and entries must be
directly readable at normal full-scene viewing distance at 1440px; a zoomed crop cannot count as a pass. Project names are no smaller than about 24px, control labels
no smaller than about 11px, and secondary status no smaller than about 9px. All are built from HTML/CSS, not laid down as brand images;
knobs are adjustable, lights toggle, and the footswitch enters the project. The device language does not spread to the ordinary interface.

## 2026-07 user correction: keep the room, retire the antique style

This correction does not overturn the original quote above, nor cancel the progressive discovery of "many things, little at first sight". It corrects the classical-Chinese
visual expression that was later layered on too heavily: the page no longer uses calligraphy, seals, xuan-paper texture, global noise, petals or ink fluff to prove its artistry.
These visual elements are no longer the current identity and should not keep appearing as decoration in the interface; text is handled only per the allowlist below.

What remains at the core: a real modern room, the guitar, three structurally different pedal/amp-head devices, warm light and shadow, restrained red,
progressive discovery chosen by the reader, and comfortable long-form reading on inner pages. Documentation and QA may call the two themes **Light / Dark**,
but the visible theme button keeps the existing 「昼 / 夜」 (Day / Night) and 「Day / Night」. Transitions and content reveals may stay, but only as
quiet, fast, reducible interface feedback, no longer interpreted as an ink-splash, ink-bleed or photographic-developing ritual.

This correction does not authorize rewriting other copy on the homepage or shared interface. Text changes are limited to: removing 「展开卷宗」 ("open the dossier") and its English counterpart;
changing the blog counts 「卷 / 题」 ("volumes / topics") to 「篇 / 标签」 ("articles / tags"); removing 「题跋」 ("colophon"); removing the visible 「授权协议 · 文末记」 ("License · end note") block.
All other copy follows the pre-correction baseline and must be kept verbatim. Red may still be used as a sparing accent for focus, status or key prompts;
it no longer carries the fixed meaning of "cinnabar, signature seal, annotation", and it should not flood the interface.

## 2026-07-29 user approval: division of labor between two homepages

Room no longer carries both the "personal space" and "career entry" tasks alone. `room.qiu.works` continues to follow this file's original direction;
`qiu.works`, a separate developer homepage, quickly answers "what can Qiu build". The two share a repository, build separately and link to each other,
but the developer homepage must not copy the Room scene as a career-page background, and Room must not be redone as a portfolio.

The user explicitly approved a limited set of Room extensions: the first screen adds a lightweight 「学生开发者 · 独立构建者」 / "CS student · indie developer"
identity anchor plus a new Chinese and English self-description; the life close-up and footer add the developer homepage and contact entries; the project archive adds VeriSilo; the share card switches to
the real room and guitar. The three homepage devices remain fixed as MealCircuit, Crewlight and Hadoop Lab, and the scene composition and exploration relationships
do not change because of the project archive addition. This approval extends only these specific texts and entries, does not rewrite the user's original words above, and does not authorize any other copy drift.
