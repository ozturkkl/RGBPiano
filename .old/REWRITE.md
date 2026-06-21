This is a very very old project and it's main purpose is one thing:
- Get my midi data from my computer over the wifi to the Rpi Zero that's hooked up to the addressible LED strip that's hooked up to my piano and have key pressess light up the LED strip.

I've not touched it in years and since then a lot has changed:
- I'm now using linux as my main (would be nice to still have something corss platform though)
- I'm now a much better dev and prefer much much simpler things than before
- I'm now more focused.

Our goal today is to do an entire re-write to this repo. We're:
- killing electron (overkill for this project, let's just serve a local http so user can visit browser to configure)
- changing the way logic works on the pi zero, getting node to work on it was a pain and I'm thinking something light is more suitable, feel free to use some other method if you're unsure, ask me my preferences.
- keeping svelte for the front end because it's sick
- updating all the dependencies
- get rid of the bluetooth stuff we started working on (scope creep, was aiming to fix windows not having native bluetooth support, not in scope for this project)
- get a better structure and a more streamlined setup, always prefer minimal readable and DRY code!

Note: i'm able to ssh into the pi and will download a clone of the repo there (that's how this repo works, pi runs without UI). I'm open to suggestions if you think this can be or should be changed.

I give you complete freedom, we need to do a glowup to this project. Matter fact, we will start fresh from a blank slate, the old code is in the .old folder. Don't feel like you have to mimic the old code, it's just there for you to study and help ideate.

You also get to choose the starting template. Don't even have to use npm if you don't want to but keep in mind we will still want to build a UI for the controls (the current ones we have like color, led count, invert, etc. etc. etc.) 

Obviously we will use safe types and typescript, no js wanted here anymore, it's 2026.

One thing you should know, even though this project is very very old. It was built with quality in mind and it has some very important logic and very nice handling of some of the neuances of the platform so if you decide to keep true to some of the code in here, that is likely the smart move. With that said, any simplification opportunity, we shall take. That's why we're starting from a fresh folder and using the old code as a reference guide.

Read everything inside @.old and to act on main root. Ask me questions if you're unsure about things or the architecture we want to go with. 

You got this, go nuts. Remember to start with creating a README.md file at the root and studying the old repo to the T. We want to progressively progress but not be blind to the old repo and what it did.

Let's go!