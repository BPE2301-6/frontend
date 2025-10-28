// Tailwind config: scan all jsx/js files
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Точные цвета из Figma CSS
        'figma-bg': '#242528',
        'figma-blue': '#1E80D9',
        'figma-orange': '#FF8800',
        'figma-white': '#FFFFFF',
        'figma-card': '#313236',
        'figma-text-secondary': '#838486',
        'figma-user-border': '#757575',
        'figma-red': '#FD5353',
        'figma-yellow': '#FDD253',
        'figma-green': '#62C53E',
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'bold': '700',
      },
      fontSize: {
        'figma-title': ['24px', '29px'],
        'figma-card-title': ['16px', '20px'],
        'figma-card-text': ['14px', '17px'],
        'figma-plus': ['45px', '55px'],
        'figma-arrow': ['32px', '39px'],
        'figma-input-text': ['48px', '59px'],
        'figma-cursor': ['48px', '59px'],
      },
      borderRadius: {
        'figma-card': '32px',
        'figma-column': '50px',
        'figma-search': '32px',
        'figma-input': '100px',
        'figma-button': '100px',
      },
      spacing: {
        'figma-header': '148px',
        'figma-card-width': '307px',
        'figma-card-height': '159px',
        'figma-column-width': '372px',
        'figma-column-height': '739px',
        'figma-input-width': '804px',
        'figma-input-height': '104px',
        'figma-button-size': '62px',
        'figma-avatar-size': '50px',
      }
    },
  },
  plugins: [],
};
