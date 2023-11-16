import Avatar from "boring-avatars";
import { AvatarComponentProps } from "@rainbow-me/rainbowkit/dist/components/RainbowKitProvider/AvatarContext";
import { useAuth } from "../contexts/AuthContext";
import { userFundraiserContext } from "../contexts/FundraiserContext";
import { useEffect, useState } from "react";


const names = [
  'Mary Baker',
  'Amelia Earhart',
  'Mary Roebling',
  'Sarah Winnemucca',
  'Margaret Brent',
  'Lucy Stone',
  'Mary Edwards',
  'Margaret Chase',
  'Mahalia Jackson',
  'Maya Angelou',
  'Margaret Bourke',
  'Eunice Kennedy',
  'Carrie Chapman',
  'Elizabeth Peratrovich',
  'Alicia Dickerson',
  'Daisy Gatson',
  'Emma Willard',
  'Amelia Boynton',
  'Maria Mitchell',
  'Sojourner Truth',
  'Willa Cather',
  'Coretta Scott',
  'Harriet Tubman',
  'Fabiola Cabeza',
  'Sacagawea',
  'Esther Martinez',
  'Elizabeth Cady',
  'Bessie Coleman',
  'Ma Rainey',
  'Julia Ward',
  'Irene Morgan',
  'Babe Didrikson',
  'Lyda Conley',
  'Annie Dodge',
  'Maud Nathan',
  'Betty Ford',
  'Rosa Parks',
  'Susan La',
  'Gertrude Stein',
  'Wilma Mankiller',
  'Grace Hopper',
  'Jane Addams',
  'Katharine Graham',
  'Florence Chadwick',
  'Zora Neale',
  'Wilma Rudolph',
  'Annie Jump',
  'Mother Frances',
  'Jovita Idár',
  'Maggie L',
  'Henrietta Swan',
  'Jane Cunningham',
  'Victoria Woodhull',
  'Helen Keller',
  'Patsy Takemoto',
  'Chien-Shiung',
  'Dorothea Dix',
  'Margaret Sanger',
  'Alice Paul',
  'Frances Willard',
  'Sally Ride',
  'Juliette Gordon',
  'Queen Lili',
  'Katharine Lee',
  'Harriet Beecher',
  'Felisa Rincon',
  'Hetty Green',
  'Belva Lockwood',
  'Biddy Mason',
  'Ida B',
  'Eleanor Roosevelt',
  'Maria Goeppert',
  'Phillis Wheatley',
  'Mary Harris',
  'Fannie Lou',
  'Rosalyn Yalow',
  'Susan B',
  'Clara Barton',
  'Lady Deborah',
  'Jane Johnston',
  'Alice Childress',
  'Georgia O',
  'Rebecca Crumpler',
  'Anne Bradstreet',
  'Elizabeth Blackwell',
  'Christa McAuliffe',
  'Edmonia Lewis',
  'Nellie Bly',
  'Mary Cassatt',
  'Pauli Murray',
  'Ellen Swallow',
  'Hedy Lamarr',
  'Pearl Kendrick',
  'Abigail Adams',
  'Margaret Fuller',
  'Emma Lazarus',
  'Marian Anderson',
  'Virginia Apgar',
  'Mary Walton',
];

type AvatarSpecs = {
  name: string;
  colors: string[];
};

function getRandomIntFromAddress(address: string, min: number, max: number): number {
  const sliceValue = parseInt(address.slice(2, 10), 16);
  return sliceValue % (max - min + 1) + min;
}

function generateRandomColorFromAddress(address: string, index: number): string {
  // Generate a random hex color based on a combination of the Ethereum address and the index
  return '#' + (parseInt(address.slice(10 + index, 10 + index + 6), 16) & 0xFFFFFF).toString(16).padStart(6, '0');
}

export function generateAvatar(address: string): AvatarSpecs {
  if (!address || !address.startsWith('0x')) {
    address = "0x0000000000000000000000000000000000000000";
  }

  // Determine number of colors (between 1 and 5)
  const numOfColors = getRandomIntFromAddress(address, 1, 5);

  // Generate the determined number of random colors
  const colors: string[] = [];
  for (let i = 0; i < numOfColors; i++) {
    colors.push(generateRandomColorFromAddress(address, i * 6));
  }

  // Use Ethereum address to derive a name from the list
  const nameIndex = parseInt(address.slice(2, 10), 16) % names.length;
  const name = names[nameIndex];

  return {
    name: name,
    colors: colors
  };
}

export const GetCustomAvatar: React.FC<AvatarComponentProps> = ({ address, ensImage, size = 40 }) => {

  const [socialAvatarURL, setSocialAvatarURL] = useState<string | undefined>(
    typeof ensImage === 'string' ? ensImage : undefined
  );
  const { getSocialAvatarURL } = userFundraiserContext();
  const { authData } = useAuth();

  useEffect(() => {
    const init = async () => {
      if (!socialAvatarURL) {
        const userInfo = getSocialAvatarURL(address)?.userinfo;
        if (userInfo) {
          setSocialAvatarURL(userInfo.profile);
        } else {
          // If userInfo is null or doesn't have a profile, reset socialAvatarURL to ensure fallback
          setSocialAvatarURL(undefined);
        }
      }
    };

    init();
  }, [address, socialAvatarURL, getSocialAvatarURL]);

  let imageUrl = socialAvatarURL;

  if (!imageUrl && authData?.oauthRedirectResult.oauth.userInfo?.profile) {
    imageUrl = authData.oauthRedirectResult.oauth.userInfo.profile;
  }

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        width={size}
        height={size}
        style={{ borderRadius: 999 }}
      />
    );
  }

  const avatarSpecs = generateAvatar(address);
  return (
    <Avatar
      size={size}
      name={avatarSpecs.name}
      variant="beam"
      colors={avatarSpecs.colors}
    />
  );
};

