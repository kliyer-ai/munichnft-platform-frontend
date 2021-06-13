import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Avatar,
  Box,
  Container,
  Card,
  CardHeader,
  CardActionArea,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Link,
  Grid,
} from "@material-ui/core";

import * as Web3 from 'web3'
import Bignumber from 'bignumber.js';
import { OpenSeaPort, Network } from 'opensea-js'
import { OrderSide } from 'opensea-js/lib/types'
import CONFIG from '../config';

const seaport = new OpenSeaPort(window.web3.currentProvider, {
  networkName: Network.Rinkeby,
});

const useStyles = makeStyles((theme) => ({
  root: {},
}));


class Listings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nfts: [],
    };
    this.RenderListings = this.RenderListings.bind(this);
    this.getData = this.getData.bind(this);
  }

  async getData() {
    const { nfts } = this.state;
    const tokenAddress = CONFIG.TOKEN_ADDRESS;
    let assetsObjects;
    try {
      assetsObjects = await seaport.api.getAssets({
        asset_contract_address: tokenAddress, // string
        offset: 0,
        limit: 10, // string | number | null
      });
    } catch (e) {
      console.log('retrying');
      setTimeout(() => {
        getData();
      }, 1500);
      return;
    }
    assetsObjects.assets.forEach((asset) => {
      let price;
      let sold = false;
      console.log(asset);
      if (asset.sellOrders) {
        if (asset.sellOrders[0]) {
          price = new Bignumber(asset.sellOrders[0].basePrice).toNumber() / 1e19;
        } else {
          price = 0;
          sold = true;
        }
      } else {
        price = 0;
        sold = true;
      }
      seaport.api.getAssets()
      const buyOrderObj = asset.sellOrders && asset.sellOrders[0];
      nfts.push({
        name: asset.name,
        imageUrlOriginal: asset.imageUrlOriginal,
        tokenId: asset.tokenId,
        description: asset.description,
        owner: asset.owner.address,
        ownerProfilePic: asset.owner.profile_img_url,
        price,
        buyOrder: buyOrderObj,
        sold,
      });
    });
    this.setState({ nfts });
  }

  async componentDidMount() {
    this.getData();
  }

  RenderListings() {
    const classes = useStyles();
    const { history } = this.props;
    let nftOwner = '';
    return (
      <Grid container spacing={10} alignContent="center" justify="center" alignItems="center">
        {this.state.nfts.map((nft) => {
          if (nft.owner.user) {
            nftOwner = nft.owner.user.username ? nft.owner.user.username : 'Owner';
          }
          console.log(nft);
          return (
            <Grid item xs={12} md={4} lg={3}>
              <Card key={nft.tokenId}>
                <CardActionArea onClick={() => history.push(`/view?item=${nft.tokenId}`)}>
                  <CardMedia
                    component="img"
                    className={classes.media}
                    image={nft.imageUrlOriginal}
                    title={nft.name}
                  />
                  <CardContent>
                    <Typography variant="h6" component="h2">{nft.name}</Typography>
                    <CardHeader
                      avatar={
                        <Avatar src={nft.ownerProfilePic} />
                      }
                      subheader={nft.owner && nft.owner.slice(0, 16)}
                    />
                  </CardContent>
                  </CardActionArea>
                  <CardActions style={{backgroundColor: "black"}}>
                    {nft.price ? (
                      <Box>
                        <Typography color="textSecondary">Price</Typography>
                        <Typography color="secondary">{nft.price} ETH</Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Typography color="textSecondary">Status</Typography>
                        <Typography color="secondary">SOLD</Typography>
                      </Box>
                    )}
                  </CardActions>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    );
  }

  render() {
    return <this.RenderListings />;
  }
}

export default Listings;
