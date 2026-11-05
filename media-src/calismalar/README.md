# Çalışmalar media

The client's files from Downloads named `Çalışmalar*`, renamed with a numeric
prefix that keeps their alphabetical order:

| # | Original            | Here        |
|---|---------------------|-------------|
| 1 | ÇalışmalarA.HEIC    | 01-A.heic → 01-A.jpg |
| 2 | ÇalışmalarA.MOV     | 02-A.mov    |
| 3 | ÇalışmalarA.png     | 03-A.png    |
| 4 | ÇalışmalarB.HEIC    | 04-B.heic → 04-B.jpg |
| 5 | ÇalışmalarB.MOV     | 05-B.mov    |
| 6 | ÇalışmalarC.HEIC    | 06-C.heic → 06-C.jpg |
| 7 | ÇalışmalarD.MOV     | 07-D.mov    |
| 8 | ÇalışmalarE.HEIC    | 08-E.heic → 08-E.jpg |

HEIC → JPEG uses Windows' WIC decoder (needs the HEIF/HEVC extensions), because
sharp's prebuilt libvips cannot decode HEVC. `.heic` and `.mov` originals are
git-ignored (≈100 MB); the JPEGs are committed so `npm run media` rebuilds
everything else.
