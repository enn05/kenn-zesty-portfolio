import ZestyTutorial from 'components/ZestyTutorial'
import React  from 'react';
import { AutoLayout } from "@zesty-io/react-autolayout";
import { Typography, Box, Tabs, Tab, Divider, Alert, AlertTitle, Link} from '@mui/material';
import PropTypes from 'prop-types';
import TabPanel from 'components/marketing-example/ui/TabPanel'

import { CustomRow } from "components/marketing-example/personalization/CustomRow";
import { CustomColumn } from "components/marketing-example/personalization/CustomColumn";
import { CustomTextarea } from "components/marketing-example/personalization/CustomTextarea";
import { CustomText } from "components/marketing-example/personalization/CustomText";
import { CustomLink } from "components/marketing-example/personalization/CustomLink";
import { CustomImage } from "components/marketing-example/personalization/CustomImage";

export default function Homepage({content}){
// AutoLayout reads content.meta.layout.json['layout:root:column:0'] and throws if it is missing.
    // A content item only has that when a Page Visual Layout is assigned to it in Zesty.
    const hasLayout = Boolean(content?.meta?.layout?.json?.['layout:root:column:0']);

    if (!hasLayout) {
        const itemURL = `https://${process.env.zesty.instance_zuid}.manager.zesty.io/content/${content?.meta?.model?.zuid}/${content?.meta?.zuid}`;

        return (
            <>
                <Box sx={{ mt: 4 }}>
                    <Alert severity="info">
                        <AlertTitle>No visual layout on this content item</AlertTitle>
                        <Typography component="p" variant="body2">
                            This page renders with <code>&lt;AutoLayout /&gt;</code>, which needs a Page Visual Layout
                            assigned to the Homepage item in Zesty.io. Build one in the manager and this page will
                            render it automatically &mdash; no code change needed.
                        </Typography>
                        <Link href={itemURL} target="_blank" rel="noopener" variant="body2">
                            Open this item in Zesty manager
                        </Link>
                    </Alert>
                </Box>
                <ZestyTutorial content={content} />
            </>
        )
    }
    
    console.log("content", content)

    return (
        <> 
           <Box sx={{ mt: 4 }}>
            <AutoLayout content={content} components={{
                    "wysiwyg_advanced": CustomTextarea,
                    "text": CustomText,
                    "column": CustomColumn,
                    "row": CustomRow,
                    "link": CustomLink,
                    "design": ZestyTutorial                   
                }} />
        </Box>
        {/* <Divider/>
            <ZestyTutorial contnet={content}></ZestyTutorial> */}
        </> 
    )
}